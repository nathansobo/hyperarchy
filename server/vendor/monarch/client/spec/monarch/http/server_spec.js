
//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Http.Server", function() {
    var server, fakeCometClient;

    before(function() {
      server = new Monarch.Http.Server();
      fakeCometClient = new FakeServer.FakeCometClient();
      mock(server, 'newCometClient', function() {
        return fakeCometClient;
      });
    });

    describe("#fetch, #save, and #subscribe", function() {
      before(function() {
        // use the fake server implementation of basic request functions (only testing higher levels of abstraction)
        server.posts = [];
        server.gets = [];
        server.get = FakeServer.prototype.get;
        server.post = FakeServer.prototype.post;
        server.request = FakeServer.prototype.request;
        server.addRequest = FakeServer.prototype.addRequest;
        server.removeRequest = FakeServer.prototype.removeRequest;
        Repository.originUrl = "/repository"
      });

      describe("#fetch(relations)", function() {
        useExampleDomainModel();

        before(function() {
          server.request = FakeServer.prototype.request;
          server.addRequest = FakeServer.prototype.addRequest;
          server.removeRequest = FakeServer.prototype.removeRequest;
        });


        it("performs a GET to {Repository.originUrl}/fetch with the json to fetch the given relations, then merges the results into the Repository with the delta events sandwiched by beforeEvents and afterEvents callback triggers on the returned future", function() {
          var future = server.fetch([Blog.table, User.table]);

          expect(server.gets).to(haveLength, 1);
          expect(server.lastGet.url).to(eq, "/repository/fetch");
          expect(server.lastGet.data).to(equal, {
            relations: [Blog.table.wireRepresentation(), User.table.wireRepresentation()]
          });

          var dataset = {
            users: {
              nathan: {
                id: 'nathan',
                full_name: "Nathan Sobo"
              },
              wil: {
                id: 'wil',
                full_name: 'Wil Bierbaum'
              }
            },
            blogs: {
              metacircular: {
                id: 'metacircular',
                user_id: 'nathan',
                name: 'Metacircular'
              },
              canyonero: {
                id: 'canyonero',
                user_id: 'wil',
                name: 'Canyonero'
              }
            }
          };

          var events = [];

          future
            .beforeEvents(function() {
            events.push('beforeEvents');
          })
            .afterEvents(function() {
            events.push('afterEvents')
          });

          mock(Repository, 'pauseEvents', function() {
            events.push('Repository.pauseEvents')
          });

          mock(Repository, 'update', function() {
            events.push('Repository.update')
          });

          mock(Repository, 'resumeEvents', function() {
            events.push('Repository.resumeEvents')
          });

          server.lastGet.simulateSuccess(null, dataset);

          expect(Repository.update).to(haveBeenCalled, withArgs(dataset));

          expect(events).to(equal, [
            'Repository.pauseEvents',
            'Repository.update',
            'beforeEvents',
            'Repository.resumeEvents',
            'afterEvents'
          ]);
        });
      });

      describe("#subscribe(relations)", function() {
        useExampleDomainModel();

        it("initializes and connects the client if needed, then performs the request", function() {
          expect(server.cometClient).to(beNull);
          var subscribeFuture = server.subscribe([Blog.table, BlogPost.table]);
          expect(server.cometClient).toNot(beNull);
          expect(fakeCometClient.connecting).to(beTrue);
          fakeCometClient.simulateConnectSuccess("sample-id");

          expect(server.posts.length).to(eq, 1);
          expect(server.lastPost.type).to(eq, "post");
          expect(server.lastPost.url).to(eq, Repository.originUrl + "/subscribe");
          expect(server.lastPost.data).to(equal, {
            real_time_client_id: "sample-id",
            relations: [Blog.table.wireRepresentation(), BlogPost.table.wireRepresentation()]
          });

          var successCallback = mockFunction("successCallback");
          subscribeFuture.onSuccess(successCallback);

          server.lastPost.simulateSuccess(["mockSubscriptionId1", "mockSubscriptionId2"]);
          var remoteSubscriptions = successCallback.mostRecentArgs[0];
          expect(remoteSubscriptions.length).to(eq, 2);
          expect(remoteSubscriptions[0].relation).to(eq, Blog.table);
          expect(remoteSubscriptions[0].id).to(eq, "mockSubscriptionId1");
          expect(remoteSubscriptions[1].relation).to(eq, BlogPost.table);
          expect(remoteSubscriptions[1].id).to(eq, "mockSubscriptionId2");

          server.newCometClient.clear();
          server.subscribe([User.table]);
          expect(server.newCometClient).toNot(haveBeenCalled);
        });

        it("causes all mutation commands received to be sent to Repository.mutate", function() {
          mock(Repository, "mutate");

          server.subscribe([Blog.table, BlogPost.table]);
          server.cometClient.simulateConnectSuccess("sample-id");
          server.cometClient.simulateReceive(['create', 'blogs', { id: 'animals' }]);

          expect(Repository.mutate).to(haveBeenCalled, withArgs([['create', 'blogs', { id: 'animals' }]]));
        });

        it("interprets a record as a subscription to a where relation constrained to the record's id", function() {
          var blog = Blog.createFromRemote({id: 1});
          var subscribeFuture = server.subscribe([blog]);
          fakeCometClient.simulateConnectSuccess("sample-id");

          expect(server.posts.length).to(eq, 1);
          expect(server.lastPost.data).to(equal, {
            real_time_client_id: "sample-id",
            relations: [Blog.where({id: 1}).wireRepresentation()]
          });
        });
      });

      describe("#unsubscribe(remoteSubscriptions)", function() {
        useExampleDomainModel();
        
        it("performs a POST to {Repository.originUrl/unsubscribe with the ids of the given RemoteSubscriptions", function() {
          var remoteSubscription1 = new Monarch.Http.RemoteSubscription("fakeSubscription1", Blog.table);
          var remoteSubscription2 = new Monarch.Http.RemoteSubscription("fakeSubscription2", BlogPost.table);

          server.cometClient = fakeCometClient;
          fakeCometClient.clientId = "sample-id"

          server.unsubscribe([remoteSubscription1, remoteSubscription2]);
          expect(server.posts.length).to(eq, 1);
          expect(server.lastPost.type).to(eq, "post");
          expect(server.lastPost.url).to(eq, Repository.originUrl + "/unsubscribe");
          expect(server.lastPost.data).to(equal, {
            real_time_client_id: "sample-id",
            subscription_ids: [remoteSubscription1.id, remoteSubscription2.id]
          });
        });
      });

      describe("#save(recordsOrRelations...)", function() {
        useLocalFixtures();

        context("when given a locally-created record", function() {
          var record, tableInsertCallback, tableUpdateCallback, tableRemoveCallback,
              recordCreateCallback, recordUpdateCallback;

          before(function() {
            record = User.localCreate({fullName: "Jesus Chang"});

            tableInsertCallback = mockFunction("table insert callback");
            User.onRemoteInsert(tableInsertCallback);
            tableUpdateCallback = mockFunction("table update callback");
            User.onRemoteUpdate(tableUpdateCallback);
            recordCreateCallback = mockFunction("record insert callback");
            record.onRemoteCreate(recordCreateCallback);
            recordUpdateCallback = mockFunction("record update callback");
            record.onRemoteUpdate(recordUpdateCallback);
            record.afterRemoteUpdate = mockFunction("optional after update hook");
            record.afterRemoteCreate = mockFunction("optional after create hook");
          });

          it("sends a create command to {Repository.originUrl}/mutate", function() {
            var record = User.localCreate({fullName: "Jesus Chang"});
            server.save(record);

            expect(server.posts.length).to(eq, 1);
            expect(server.lastPost.url).to(eq, "/repository/mutate");
            expect(server.lastPost.data).to(equal, {
              operations: [['create', 'users', record.dirtyWireRepresentation()]]
            });
          });

          context("when the request is successful", function() {
            it("finalizes the creation of the record and fires insert handlers between the beforeEvents and afterEvents callbacks", function() {
              var saveFuture = server.save(record);

              var beforeEventsCallback = mockFunction("before events", function() {
                expect(tableInsertCallback).toNot(haveBeenCalled);
                expect(recordCreateCallback).toNot(haveBeenCalled);
                expect(record.afterRemoteCreate).toNot(haveBeenCalled);
                expect(record.id()).to(eq, "jesus");
                expect(record.fullName()).to(eq, "Jesus H. Chang");
              });

              var afterEventsCallback = mockFunction("after events", function() {
                expect(tableInsertCallback).to(haveBeenCalled, withArgs(record));
                expect(recordCreateCallback).to(haveBeenCalled, withArgs(record));
                expect(record.afterRemoteCreate).to(haveBeenCalled, once);

                expect(tableUpdateCallback).toNot(haveBeenCalled);
                expect(recordUpdateCallback).toNot(haveBeenCalled);
                expect(record.afterRemoteUpdate).toNot(haveBeenCalled);
              });
              saveFuture.beforeEvents(beforeEventsCallback);
              saveFuture.afterEvents(afterEventsCallback);

              var post = server.lastPost.simulateSuccess({
                primary: [{
                  id: "jesus",
                  full_name: "Jesus H. Chang"
                }],
                secondary: []
              });

              expect(beforeEventsCallback).to(haveBeenCalled, withArgs(record));
              expect(afterEventsCallback).to(haveBeenCalled, withArgs(record));
            });
          });

          context("when the request is unsuccessful", function() {
            it("adds validation errors to the local fields without changing remote fields and calls the on failure callback with the invalid record", function() {
              var saveFuture = server.save(record);

              var failureCallback = mockFunction('failureCallback');
              saveFuture.onFailure(failureCallback);

              server.lastPost.simulateFailure({
                index: 0,
                errors: {
                  full_name: ["This name is extremely unlikely"],
                  age: ["You must enter an age"]
                }
              });

              expect(failureCallback).to(haveBeenCalled, withArgs(record));
              expect(record.valid()).to(beFalse);
              expect(record.field('fullName').validationErrors).to(equal, ["This name is extremely unlikely"]);
              expect(record.field('age').validationErrors).to(equal, ["You must enter an age"]);

              expect(tableInsertCallback).toNot(haveBeenCalled);
              expect(recordCreateCallback).toNot(haveBeenCalled);
              expect(record.afterRemoteCreate).toNot(haveBeenCalled);
            });
          });
        });

        context("when given a locally-updated record", function() {
          var record, nameBeforeUpdate, funProfitNameBeforeUpdate, userIdBeforeUpdate,
              tableRemoteUpdateCallback, recordRemoteUpdateCallback;

          before(function() {
            record = Blog.fixture('recipes');
            expect(record.localVersion).to(eq, 0);
            nameBeforeUpdate = record.name();
            funProfitNameBeforeUpdate = record.funProfitName();
            userIdBeforeUpdate = record.userId();

            tableRemoteUpdateCallback = mockFunction("table update callback");
            recordRemoteUpdateCallback = mockFunction("record update callback");
            Blog.onRemoteUpdate(tableRemoteUpdateCallback);
            record.onRemoteUpdate(recordRemoteUpdateCallback);
            record.afterRemoteUpdate = mockFunction("optional record on update method");
          });

          it("sends an update command to {Repository.originUrl}/mutate", function() {
            record.name("Bad Bad Children");
            server.save(record);

            expect(server.posts.length).to(eq, 1);
            expect(server.lastPost.url).to(eq, "/repository/mutate");
            expect(server.lastPost.data).to(equal, {
              operations: [['update', 'blogs', 'recipes', record.dirtyWireRepresentation()]]
            });
          });

          context("when the request is successful", function() {
            it("marks the record valid, updates the remote and local field values, and fires the remote event callbacks sandwiched between beforeEvents and afterEvents callbacks", function() {
              record.assignValidationErrors({
                name: "Bad name!"
              });
              expect(record.valid()).to(beFalse);

              record.localUpdate({
                name: "Programming",
                userId: 'wil'
              });

              var tableLocalUpdateCallback = mockFunction('tableLocalUpdateCallback');
              var recordLocalUpdateCallback = mockFunction('recordLocalUpdateCallback');
              Blog.onLocalUpdate(tableLocalUpdateCallback);
              record.onLocalUpdate(recordLocalUpdateCallback);
              record.afterLocalUpdate = mockFunction('optional afterLocalUpdate hook');

              var saveFuture = server.save(record);

              expect(record.remote.name()).to(eq, nameBeforeUpdate);
              expect(record.remote.funProfitName()).to(eq, funProfitNameBeforeUpdate);
              expect(record.remote.userId()).to(eq, userIdBeforeUpdate);

              var beforeEventsCallback = mockFunction('before events callback', function() {
                expect(tableRemoteUpdateCallback).toNot(haveBeenCalled);
                expect(recordRemoteUpdateCallback).toNot(haveBeenCalled);
                expect(record.afterRemoteUpdate).toNot(haveBeenCalled);
              });
              var afterEventsCallback = mockFunction('after events callback', function() {
                var expectedChangset = {
                  userId: {
                    column: Blog.userId,
                    oldValue: userIdBeforeUpdate,
                    newValue: 'wil'
                  },
                  name: {
                    column: Blog.name_,
                    oldValue: nameBeforeUpdate,
                    newValue: 'Programming Prime'
                  },
                  funProfitName: {
                    column: Blog.funProfitName,
                    oldValue: funProfitNameBeforeUpdate,
                    newValue: 'Programming Prime for Fun and Profit'
                  }
                };

                expect(record.valid()).to(beTrue);

                expect(tableRemoteUpdateCallback).to(haveBeenCalled, withArgs(record, expectedChangset));
                expect(recordRemoteUpdateCallback).to(haveBeenCalled, withArgs(expectedChangset));
                expect(record.afterRemoteUpdate).to(haveBeenCalled, withArgs(expectedChangset));

                // remote update may change local field values but they should not fire local update callbacks because
                // the change was initiated remotely
                expect(tableLocalUpdateCallback).toNot(haveBeenCalled);
                expect(recordLocalUpdateCallback).toNot(haveBeenCalled);
                expect(record.afterLocalUpdate).toNot(haveBeenCalled);
              });

              saveFuture.beforeEvents(beforeEventsCallback);
              saveFuture.afterEvents(afterEventsCallback);
              server.lastPost.simulateSuccess({
                primary: [{
                  name: "Programming Prime", // server can change field values too
                  user_id: 'wil'
                }],
                secondary: []
              });

              expect(record.local.name()).to(eq, "Programming Prime");
              expect(record.local.funProfitName()).to(eq, "Programming Prime for Fun and Profit");
              expect(record.local.userId()).to(eq, "wil");

              expect(record.remote.name()).to(eq, "Programming Prime");
              expect(record.remote.funProfitName()).to(eq, "Programming Prime for Fun and Profit");
              expect(record.remote.userId()).to(eq, "wil");

              expect(beforeEventsCallback).to(haveBeenCalled);
              expect(afterEventsCallback).to(haveBeenCalled);
            });
          });

          context("when the request is unsuccessful", function() {
            it("adds validation errors to the local fields without changing remote fields and calls the on failure callback with the invalid record", function() {
              record.localUpdate({
                name: "Programming",
                userId: 'wil'
              });

              var onFailureCallback = mockFunction("onFailureCallback");
              server.save(record).onFailure(onFailureCallback);

              var nameErrors = ["This name is already taken"];
              var userIdErrors = ["This name is already taken"];
              server.lastPost.simulateFailure({
                index: 0,
                errors: {
                  name: nameErrors,
                  user_id: userIdErrors
                }
              });

              expect(record.local.name()).to(eq, "Programming");
              expect(record.local.funProfitName()).to(eq, "Programming for Fun and Profit");
              expect(record.local.userId()).to(eq, "wil");

              expect(record.remote.name()).to(eq, nameBeforeUpdate);
              expect(record.remote.funProfitName()).to(eq, funProfitNameBeforeUpdate);
              expect(record.remote.userId()).to(eq, userIdBeforeUpdate);

              expect(onFailureCallback).to(haveBeenCalled, withArgs(record));
              expect(record.local.field('name').validationErrors).to(eq, nameErrors);
              expect(record.local.field('userId').validationErrors).to(eq, userIdErrors);

              expect(tableRemoteUpdateCallback).toNot(haveBeenCalled);
              expect(recordRemoteUpdateCallback).toNot(haveBeenCalled);
              expect(record.onRemoteUpdate).toNot(haveBeenCalled);
            });

            context("when the record is changed again while a save is being processed by the server", function() {
              it("does not mark the record clean again or stomp over the new changes", function() {
                expect(record.remoteVersion).to(eq, 0);
                expect(record.pendingVersion).to(eq, 0);
                expect(record.localVersion).to(eq, 0);

                record.name("Bad Bad Children");
                record.userId("funda");

                expect(record.remoteVersion).to(eq, 0);
                expect(record.pendingVersion).to(eq, 0);
                expect(record.localVersion).to(eq, 1);

                server.save(record);

                expect(record.remoteVersion).to(eq, 0);
                expect(record.pendingVersion).to(eq, 1);
                expect(record.localVersion).to(eq, 1);

                expect(server.posts.length).to(eq, 1);
                expect(server.lastPost.url).to(eq, "/repository/mutate");
                expect(server.lastPost.data).to(equal, {
                  operations: [['update', 'blogs', 'recipes', { name: "Bad Bad Children", user_id: "funda" }]]
                });

                record.name("Bratty Argentine Children");

                expect(record.remoteVersion).to(eq, 0);
                expect(record.pendingVersion).to(eq, 1);
                expect(record.localVersion).to(eq, 2);
                expect(record.field('name').version).to(eq, 2);

                server.lastPost.simulateSuccess({
                  primary: [{
                    name: "Bad Bad Children", // server can change field values too
                    user_id: 'funda'
                  }],
                  secondary: []
                });

                expect(record.name()).to(eq, "Bratty Argentine Children");
                expect(record.field('name').version).to(eq, 2);
                expect(record.userId()).to(eq, "funda");
                expect(record.field('userId').version).to(eq, 1);
                expect(record.dirty()).to(beTrue);

                expect(record.remoteVersion).to(eq, 1);
                expect(record.pendingVersion).to(eq, 1);
                expect(record.localVersion).to(eq, 2);

                server.save(record);

                expect(record.remoteVersion).to(eq, 1);
                expect(record.pendingVersion).to(eq, 2);
                expect(record.localVersion).to(eq, 2);

                expect(server.posts.length).to(eq, 1);
                expect(server.lastPost.url).to(eq, "/repository/mutate");
                expect(server.lastPost.data).to(equal, {
                  operations: [['update', 'blogs', 'recipes', { name: "Bratty Argentine Children" }]]
                });
              });
            });
          });
        });

        context("when given a locally-destroyed record", function() {
          var record, tableRemoveCallback, recordDestroyCallback;

          before(function() {
            record = Blog.fixture('recipes');
            tableRemoveCallback = mockFunction("table remove callback");
            Blog.onRemoteRemove(tableRemoveCallback);
            recordDestroyCallback = mockFunction("record remove callback");
            record.onRemoteDestroy(recordDestroyCallback)
            record.afterRemoteDestroy = mockFunction("optional afterRemoteDestroy method");
          });

          it("sends a destroy command to {Repository.originUrl}/mutate", function() {
            record.localDestroy();
            server.save(record);

            expect(server.posts.length).to(eq, 1);
            expect(server.lastPost.url).to(eq, "/repository/mutate");
            expect(server.lastPost.data).to(equal, {
              operations: [['destroy', 'blogs', 'recipes']]
            });
          });

          context("when the request is successful", function() {
            it("finalizes the destruction of the record, firing onRemoteRemove callbacks in between the beforeEvents and afterEvents callbacks", function() {
              record.localDestroy();
              var saveFuture = server.save(record);

              var beforeEventsCallback = mockFunction("before events", function() {
                expect(tableRemoveCallback).toNot(haveBeenCalled);
                expect(recordDestroyCallback).toNot(haveBeenCalled);
                expect(record.afterRemoteDestroy).toNot(haveBeenCalled);
              });
              var afterEventsCallback = mockFunction("after events", function() {
                expect(tableRemoveCallback).to(haveBeenCalled, once);
                expect(recordDestroyCallback).to(haveBeenCalled, once);
                expect(record.afterRemoteDestroy).to(haveBeenCalled, once);
              });
              var onFailureCallback = mockFunction("onFailureCallback");
              saveFuture.beforeEvents(beforeEventsCallback);
              saveFuture.afterEvents(afterEventsCallback);
              saveFuture.onFailure(onFailureCallback);

              server.lastPost.simulateSuccess({primary: [null], secondary: []});

              expect(Blog.find('recipes')).to(beNull);
              expect(_.any(Blog.table._tuples, function(r) { r === record})).to(beFalse);
              expect('recipes' in Blog.table.tuplesById).to(beFalse);

              expect(beforeEventsCallback).to(haveBeenCalled);
              expect(afterEventsCallback).to(haveBeenCalled);
            });
          });

          context("when the request is unsuccessful", function() {
            it("triggers onFailure callbacks and does not trigger removal events", function() {
              record.localDestroy();
              var saveFuture = server.save(record);

              var beforeEventsCallback = mockFunction('beforeEventsCallback');
              var afterEventsCallback = mockFunction('afterEventsCallback');
              var onFailureCallback = mockFunction('onFailureCallback');
              saveFuture.beforeEvents(beforeEventsCallback);
              saveFuture.afterEvents(afterEventsCallback);
              saveFuture.onFailure(onFailureCallback);

              server.lastPost.simulateFailure({index: 0, errors: {}});

              expect(beforeEventsCallback).toNot(haveBeenCalled);
              expect(afterEventsCallback).toNot(haveBeenCalled);
              expect(onFailureCallback).to(haveBeenCalled, withArgs(record));

              expect(tableRemoveCallback).toNot(haveBeenCalled);
              expect(recordDestroyCallback).toNot(haveBeenCalled);
              expect(record.afterRemoteDestroy).toNot(haveBeenCalled);
            });
          });
        });

        context("when given a mix of dirty and clean records and relations containing some dirty records", function() {
          var locallyCreated, locallyUpdated, locallyDestroyed, insertCallback, updateCallback, removeCallback;

          before(function() {
            locallyCreated = User.localCreate({fullName: "Jesus Chang"});
            locallyUpdated = User.fixture('jan');
            locallyUpdated.fullName("Francisco Wu");
            locallyDestroyed = locallyUpdated.blogs().first();
            locallyDestroyed.localDestroy();

            insertCallback = mockFunction('insertCallback');
            updateCallback = mockFunction('updateCallback');
            removeCallback = mockFunction('removeCallback');

            User.onRemoteInsert(insertCallback);
            User.onRemoteUpdate(updateCallback);
            Blog.onRemoteRemove(removeCallback);
          });

          it("performs a batch mutation representing the state of all the dirty records", function() {
            server.save(locallyCreated, locallyUpdated, locallyUpdated.blogs());

            expect(server.posts.length).to(eq, 1);

            expect(server.lastPost.url).to(eq, "/repository/mutate");
            expect(server.lastPost.data).to(equal, {
              operations: [
                ['create', 'users', locallyCreated.dirtyWireRepresentation()],
                ['update', 'users', locallyUpdated.id(), locallyUpdated.dirtyWireRepresentation()],
                ['destroy', 'blogs', locallyDestroyed.id()]
              ]
            });
          });

          context("when the request is successful", function() {
            it("finalizes all the local mutations and fires remote event callbacks", function() {
              var saveFuture = server.save(locallyCreated, locallyUpdated, locallyUpdated.blogs());

              var beforeEventsCallback = mockFunction('beforeEventsCallback', function() {
                expect(insertCallback).toNot(haveBeenCalled);
                expect(updateCallback).toNot(haveBeenCalled);
                expect(removeCallback).toNot(haveBeenCalled);
              });

              var afterEventsCallback = mockFunction('afterEventsCallback', function() {
                expect(insertCallback).to(haveBeenCalled, withArgs(locallyCreated));
                expect(updateCallback).to(haveBeenCalled, withArgs(locallyUpdated, {
                  fullName: {
                    column: User.fullName,
                    oldValue: "Jan Nelson",
                    newValue: "Francisco Wu"
                  }
                }));
                expect(removeCallback).to(haveBeenCalled, withArgs(locallyDestroyed));
              });

              saveFuture.beforeEvents(beforeEventsCallback);
              saveFuture.afterEvents(afterEventsCallback);

              server.lastPost.simulateSuccess({
                primary: [{ id: 'jesus', full_name: "Jesus Chang" }, { full_name: "Francisco Wu" }, null],
                secondary: []
              });

              expect(beforeEventsCallback).to(haveBeenCalled, once);
              expect(afterEventsCallback).to(haveBeenCalled, once);

              expect(locallyCreated.remotelyCreated).to(beTrue);
              expect(locallyUpdated.remote.fullName()).to(eq, "Francisco Wu");
              expect(_.include(Blog.table.allTuples(), locallyDestroyed)).to(beFalse);
            });
          });

          context("when the request is unsuccessful", function() {
            it("does not finalize any of the mutations, does not fire events, and calls the onFailure callback with the offending record", function() {
              var saveFuture = server.save(locallyCreated, locallyUpdated, locallyUpdated.blogs());

              var beforeEventsCallback = mockFunction('beforeEventsCallback');
              var afterEventsCallback = mockFunction('afterEventsCallback');
              var onFailureCallback = mockFunction('onFailureCallback');
              saveFuture.beforeEvents(beforeEventsCallback);
              saveFuture.afterEvents(afterEventsCallback);
              saveFuture.onFailure(onFailureCallback);

              server.lastPost.simulateFailure({ index: 1, errors: { full_name: ["That name is taken"]}});

              expect(onFailureCallback).to(haveBeenCalled, withArgs(locallyUpdated));

              expect(locallyCreated.isRemotelyCreated).to(beFalse);
              expect(locallyUpdated.field('fullName').validationErrors).to(equal, ["That name is taken"]);
              expect(locallyUpdated.remote.fullName()).to(eq, "Jan Nelson");
              expect(_.include(Blog.table.allTuples(), locallyDestroyed)).to(beTrue);
            });
          });
        });

        context("when given only clean records", function() {
          it("does not post to the server, but still triggers before and after events callbacks with the first record", function() {
            var beforeEventsCallback = mockFunction('beforeEventsCallback');
            var afterEventsCallback = mockFunction('afterEventsCallback');
            var cleanRecord = User.fixture('jan')
            var future = server.save(cleanRecord, cleanRecord.blogs());

            future.beforeEvents(beforeEventsCallback);
            future.afterEvents(afterEventsCallback);

            expect(server.posts).to(beEmpty);

            expect(beforeEventsCallback).to(haveBeenCalled, withArgs(cleanRecord));
            expect(afterEventsCallback).to(haveBeenCalled, withArgs(cleanRecord));
          });
        });

        it("pauses mutations before sending the save to the server and resumes them once the server responds", function() {
          var record = User.localCreate({id: 'jesus', fullName: "Jesus Chang"});
          server.save(record);

          expect(Repository.mutationsPaused).to(beTrue);
          server.lastPost.simulateFailure({
            index: 0,
            errors: { full_name: ["Jesus Chang? Come on."]}
          });
          expect(Repository.mutationsPaused).to(beFalse);

          server.save(record);
          expect(Repository.mutationsPaused).to(beTrue);
          server.lastPost.simulateSuccess({
            primary: [{
              full_name: "Jesus Chang",
              user_id: 'jesus'
            }],
            secondary: []
          });
          expect(Repository.mutationsPaused).to(beFalse);
        });
      });
    });
    

    describe("request methods", function() {
      var requestMethod;

      scenario("#post(url, data)", function() {
        init(function() {
          requestMethod = 'post';
        });
      });

      scenario("#get(url, data)", function() {
        init(function() {
          requestMethod = 'get';
        });
      });

      scenario("#put(url, data)", function() {
        init(function() {
          requestMethod = 'put';
        });
      });

      scenario("#delete(url, data)", function() {
        init(function() {
          requestMethod = 'delete_';
        });
      });

      it("calls jQuery.ajax with the correct request type, returning an AjaxFuture whose #handleResponse method is called upon receiving a response", function() {
        mock(jQuery, 'ajax');

        var data = {
          foo: {
            bar: "baz",
            quux: 1
          },
          baz: "hello",
          corge: [1, 2],
          grault: 1
        };

        var future = server[requestMethod].call(server, "/users", data);

        expect(jQuery.ajax).to(haveBeenCalled, once);

        var ajaxOptions = jQuery.ajax.mostRecentArgs[0];
        expect(ajaxOptions.type).to(eq, requestMethod.toUpperCase().replace("_", ""));
        expect(ajaxOptions.dataType).to(eq, 'json');

        // data is url-encoded and appended as params for delete requests
        if (requestMethod == "delete_") {
          var expectedData = _.extend({cometClientId: window.COMET_CLIENT_ID}, data)
          expect(ajaxOptions.url).to(eq, '/users?' + jQuery.param(server.stringifyJsonData(expectedData)));
          expect(ajaxOptions.data).to(beNull);
        } else {
          expect(ajaxOptions.url).to(eq, '/users');
          expect(JSON.parse(ajaxOptions.data.foo)).to(equal, data.foo);
          expect(ajaxOptions.data.baz).to(eq, data.baz);
          expect(JSON.parse(ajaxOptions.data.corge)).to(equal, data.corge);
          expect(JSON.parse(ajaxOptions.data.grault)).to(equal, data.grault);
        }

        expect(future.constructor).to(eq, Monarch.Http.AjaxFuture);

        mock(future, 'handleResponse');

        var responseJson = {
          success: true,
          data: {
            foo: "bar"
          }
        };
        ajaxOptions.success(responseJson);
        expect(future.handleResponse).to(haveBeenCalled, withArgs(responseJson));
      });

      it("triggers error callbacks if the request terminates with an error", function() {
        mock(jQuery, 'ajax');
        var data = { foo: "bar" };
        var future = server[requestMethod].call(server, "/users", data);
        var ajaxOptions = jQuery.ajax.mostRecentArgs[0];
        
        var errorCallback = mockFunction("errorCallback");
        future.onError(errorCallback);
        ajaxOptions.error("mock XMLHttpRequest", "error", "exception");
        expect(errorCallback).to(haveBeenCalled, withArgs("mock XMLHttpRequest", "error", "exception"));
      });
    });
  });
}});
