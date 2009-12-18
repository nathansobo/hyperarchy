//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Http.Server", function() {
    var server;

    before(function() {
      server = new Monarch.Http.Server();
    });

    describe("#fetch and #save", function() {
      before(function() {
        // use the fake server implementation of basic request functions (only testing higher levels of abstraction)
        server.posts = [];
        server.gets = [];
        server.get = FakeServer.prototype.get;
        server.post = FakeServer.prototype.post;
        server.request = FakeServer.prototype.request;
        server.add_request = FakeServer.prototype.add_request;
        server.remove_request = FakeServer.prototype.remove_request;
      });

      describe("#fetch(relations)", function() {
        use_example_domain_model();

        before(function() {
          server.request = FakeServer.prototype.request;
          server.add_request = FakeServer.prototype.add_request;
          server.remove_request = FakeServer.prototype.remove_request;
        });


        it("performs a GET to Repository.origin_url with the json to fetch the given Relations, then merges the results into the Repository with the delta events sandwiched by before_events and after_events callback triggers on the returned future", function() {
          Repository.origin_url = "/users/steph/repository"
          var future = server.fetch([Blog.table, User.table]);

          expect(server.gets).to(have_length, 1);
          expect(server.last_get.url).to(equal, "/users/steph/repository");
          expect(server.last_get.data).to(equal, {
            relations: [Blog.table.wire_representation(), User.table.wire_representation()]
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
            .before_events(function() {
            events.push('before_events');
          })
            .after_events(function() {
            events.push('after_events')
          });

          mock(Repository, 'pause_events', function() {
            events.push('Repository.pause_events')
          });

          mock(Repository, 'update', function() {
            events.push('Repository.update')
          });

          mock(Repository, 'resume_events', function() {
            events.push('Repository.resume_events')
          });

          server.last_get.simulate_success(dataset);

          expect(Repository.update).to(have_been_called, with_args(dataset));

          expect(events).to(equal, [
            'Repository.pause_events',
            'Repository.update',
            'before_events',
            'Repository.resume_events',
            'after_events'
          ]);
        });
      });

      describe("#save(records_or_relations...)", function() {
        use_local_fixtures();

        before(function() {
          Repository.origin_url = "/repo";
        });


        context("when given a locally-created record", function() {

          var record, table_insert_callback, table_update_callback, table_remove_callback,
              record_create_callback, record_update_callback;

          before(function() {
            record = User.local_create({full_name: "Jesus Chang"});

            table_insert_callback = mock_function("table insert callback");
            User.on_insert(table_insert_callback);
            table_update_callback = mock_function("table update callback");
            User.on_update(table_update_callback);
            record_create_callback = mock_function("record insert callback");
            record.on_create(record_create_callback);
            record_update_callback = mock_function("record update callback");
            record.on_update(record_update_callback);
            record.after_update = mock_function("optional after update hook");
            record.after_create = mock_function("optional after create hook");
          });

          it("sends a create command", function() {
            var record = User.local_create({full_name: "Jesus Chang"});
            server.save(record);

            expect(server.posts.length).to(equal, 1);
            expect(server.last_post.url).to(equal, Repository.origin_url);
            expect(server.last_post.data).to(equal, {
              operations: [['create', 'users', record.dirty_wire_representation()]]
            });
          });

          context("when the request is successful", function() {
            it("finalizes the creation of the record and fires insert handlers between the before_events and after_events callbacks", function() {
              var save_future = server.save(record);

              var before_events_callback = mock_function("before events", function() {
                expect(table_insert_callback).to_not(have_been_called);
                expect(record_create_callback).to_not(have_been_called);
                expect(record.after_create).to_not(have_been_called);
                expect(record.id()).to(equal, "jesus");
                expect(record.full_name()).to(equal, "Jesus H. Chang");
              });

              var after_events_callback = mock_function("after events", function() {
                expect(table_insert_callback).to(have_been_called, with_args(record));
                expect(record_create_callback).to(have_been_called, with_args(record));
                expect(record.after_create).to(have_been_called, once);

                expect(table_update_callback).to_not(have_been_called);
                expect(record_update_callback).to_not(have_been_called);
                expect(record.after_update).to_not(have_been_called);
              });
              save_future.before_events(before_events_callback);
              save_future.after_events(after_events_callback);

              var post = server.last_post.simulate_success({
                primary: [{
                  id: "jesus",
                  full_name: "Jesus H. Chang"
                }],
                secondary: []
              });

              expect(before_events_callback).to(have_been_called, with_args(record));
              expect(after_events_callback).to(have_been_called, with_args(record));
            });
          });

          context("when the request is unsuccessful", function() {
            it("adds validation errors to the local fields without changing remote fields and calls the on failure callback with the invalid record", function() {
              var save_future = server.save(record);

              var failure_callback = mock_function('failure_callback');
              save_future.on_failure(failure_callback);

              server.last_post.simulate_failure({
                index: 0,
                errors: {
                  full_name: ["This name is extremely unlikely"],
                  age: ["You must enter an age"]
                }
              });

              expect(failure_callback).to(have_been_called, with_args(record));
              expect(record.valid()).to(be_false);
              expect(record.field('full_name').validation_errors).to(equal, ["This name is extremely unlikely"]);
              expect(record.field('age').validation_errors).to(equal, ["You must enter an age"]);

              expect(table_insert_callback).to_not(have_been_called);
              expect(record_create_callback).to_not(have_been_called);
              expect(record.after_create).to_not(have_been_called);
            });
          });
        });

        context("when given a locally-updated record", function() {
          var record, name_before_update, fun_profit_name_before_update, user_id_before_update,
              table_update_callback, record_update_callback;

          before(function() {
            record = Blog.find('recipes');
            name_before_update = record.name();
            fun_profit_name_before_update = record.fun_profit_name();
            user_id_before_update = record.user_id();

            table_update_callback = mock_function("table update callback");
            record_update_callback = mock_function("record update callback");
            Blog.on_update(table_update_callback);
            record.on_update(record_update_callback);
            record.after_update = mock_function("optional record on update method");
          });

          it("sends an update command", function() {
            record.name("Bad Bad Children");
            server.save(record);

            expect(server.posts.length).to(equal, 1);
            expect(server.last_post.url).to(equal, Repository.origin_url);
            expect(server.last_post.data).to(equal, {
              operations: [['update', 'blogs', 'recipes', record.dirty_wire_representation()]]
            });
          });

          context("when the request is successful", function() {
            it("updates the remote field values and fires the before_events and after_events callbacks", function() {
              record.local_update({
                name: "Programming",
                user_id: 'wil'
              });

              var save_future = server.save(record);

              expect(record.remote.name()).to(equal, name_before_update);
              expect(record.remote.fun_profit_name()).to(equal, fun_profit_name_before_update);
              expect(record.remote.user_id()).to(equal, user_id_before_update);

              var before_events_callback = mock_function('before events callback', function() {
                expect(table_update_callback).to_not(have_been_called);
                expect(record_update_callback).to_not(have_been_called);
                expect(record.after_update).to_not(have_been_called);
              });
              var after_events_callback = mock_function('after events callback', function() {
                var expected_changset = {
                  user_id: {
                    column: Blog.user_id,
                    old_value: user_id_before_update,
                    new_value: 'wil'
                  },
                  name: {
                    column: Blog.name_,
                    old_value: name_before_update,
                    new_value: 'Programming Prime'
                  },
                  fun_profit_name: {
                    column: Blog.fun_profit_name,
                    old_value: fun_profit_name_before_update,
                    new_value: 'Programming Prime for Fun and Profit'
                  }
                };

                expect(table_update_callback).to(have_been_called, with_args(record, expected_changset));
                expect(record_update_callback).to(have_been_called, with_args(expected_changset));
                expect(record.after_update).to(have_been_called, with_args(expected_changset));
              });

              save_future.before_events(before_events_callback);
              save_future.after_events(after_events_callback);

              server.last_post.simulate_success({
                primary: [{
                  name: "Programming Prime", // server can change field values too
                  user_id: 'wil'
                }],
                secondary: []
              });

              expect(record.local.name()).to(equal, "Programming Prime");
              expect(record.local.fun_profit_name()).to(equal, "Programming Prime for Fun and Profit");
              expect(record.local.user_id()).to(equal, "wil");

              expect(record.remote.name()).to(equal, "Programming Prime");
              expect(record.remote.fun_profit_name()).to(equal, "Programming Prime for Fun and Profit");
              expect(record.remote.user_id()).to(equal, "wil");

              expect(before_events_callback).to(have_been_called);
              expect(after_events_callback).to(have_been_called);
            });
          });

          context("when the request is unsuccessful", function() {
            it("adds validation errors to the local fields without changing remote fields and calls the on failure callback with the invalid record", function() {
              record.local_update({
                name: "Programming",
                user_id: 'wil'
              });

              var on_failure_callback = mock_function("on_failure_callback");
              server.save(record).on_failure(on_failure_callback);

              var name_errors = ["This name is already taken"];
              var user_id_errors = ["This name is already taken"];
              server.last_post.simulate_failure({
                index: 0,
                errors: {
                  name: name_errors,
                  user_id: user_id_errors
                }
              });

              expect(record.local.name()).to(equal, "Programming");
              expect(record.local.fun_profit_name()).to(equal, "Programming for Fun and Profit");
              expect(record.local.user_id()).to(equal, "wil");

              expect(record.remote.name()).to(equal, name_before_update);
              expect(record.remote.fun_profit_name()).to(equal, fun_profit_name_before_update);
              expect(record.remote.user_id()).to(equal, user_id_before_update);

              expect(on_failure_callback).to(have_been_called, with_args(record));
              expect(record.local.field('name').validation_errors).to(equal, name_errors);
              expect(record.local.field('user_id').validation_errors).to(equal, user_id_errors);

              expect(table_update_callback).to_not(have_been_called);
              expect(record_update_callback).to_not(have_been_called);
              expect(record.on_update).to_not(have_been_called);
            });
          });
        });

        context("when given a locally-destroyed record", function() {
          var record, table_remove_callback, record_destroy_callback;

          before(function() {
            record = Blog.find('recipes');
            table_remove_callback = mock_function("table remove callback");
            Blog.on_remove(table_remove_callback);
            record_destroy_callback = mock_function("record remove callback");
            record.on_destroy(record_destroy_callback)
            record.after_destroy = mock_function("optional after_destroy method");
          });

          it("sends a destroy command", function() {
            record.local_destroy();
            server.save(record);

            expect(server.posts.length).to(equal, 1);
            expect(server.last_post.url).to(equal, Repository.origin_url);
            expect(server.last_post.data).to(equal, {
              operations: [['destroy', 'blogs', 'recipes']]
            });
          });

          context("when the request is successful", function() {
            it("finalizes the destruction of the record, firing on_remove callbacks in between the before_events and after_events callbacks", function() {
              record.local_destroy();
              var save_future = server.save(record);

              var before_events_callback = mock_function("before events", function() {
                expect(table_remove_callback).to_not(have_been_called);
                expect(record_destroy_callback).to_not(have_been_called);
                expect(record.after_destroy).to_not(have_been_called);
              });
              var after_events_callback = mock_function("after events", function() {
                expect(table_remove_callback).to(have_been_called, once);
                expect(record_destroy_callback).to(have_been_called, once);
                expect(record.after_destroy).to(have_been_called, once);
              });
              var on_failure_callback = mock_function("on_failure_callback");
              save_future.before_events(before_events_callback);
              save_future.after_events(after_events_callback);
              save_future.on_failure(on_failure_callback);

              server.last_post.simulate_success({primary: [null], secondary: []});

              expect(Blog.find('recipes')).to(be_null);
              expect(Monarch.Util.any(Blog.table._tuples, function(r) { r === record})).to(be_false);
              expect('recipes' in Blog.table.tuples_by_id).to(be_false);

              expect(before_events_callback).to(have_been_called);
              expect(after_events_callback).to(have_been_called);
            });
          });

          context("when the request is unsuccessful", function() {
            it("triggers on_failure callbacks and does not trigger removal events", function() {
              record.local_destroy();
              var save_future = server.save(record);

              var before_events_callback = mock_function('before_events_callback');
              var after_events_callback = mock_function('after_events_callback');
              var on_failure_callback = mock_function('on_failure_callback');
              save_future.before_events(before_events_callback);
              save_future.after_events(after_events_callback);
              save_future.on_failure(on_failure_callback);

              server.last_post.simulate_failure({index: 0, errors: {}});

              expect(before_events_callback).to_not(have_been_called);
              expect(after_events_callback).to_not(have_been_called);
              expect(on_failure_callback).to(have_been_called, with_args(record));

              expect(table_remove_callback).to_not(have_been_called);
              expect(record_destroy_callback).to_not(have_been_called);
              expect(record.after_destroy).to_not(have_been_called);
            });
          });
        });

        context("when given a mix of dirty and clean records and relations containing some dirty records", function() {
          var locally_created, locally_updated, locally_destroyed, insert_callback, update_callback, remove_callback;

          before(function() {
            locally_created = User.local_create({full_name: "Jesus Chang"});
            locally_updated = User.find('jan');
            locally_updated.full_name("Francisco Wu");
            locally_destroyed = locally_updated.blogs().first();
            locally_destroyed.local_destroy();

            insert_callback = mock_function('insert_callback');
            update_callback = mock_function('update_callback');
            remove_callback = mock_function('remove_callback');

            User.on_insert(insert_callback);
            User.on_update(update_callback);
            Blog.on_remove(remove_callback);
          });

          it("performs a batch mutation representing the state of all the dirty records", function() {
            server.save(locally_created, locally_updated, locally_updated.blogs());

            expect(server.posts.length).to(equal, 1);

            expect(server.last_post.url).to(equal, Repository.origin_url);
            expect(server.last_post.data).to(equal, {
              operations: [
                ['create', 'users', locally_created.dirty_wire_representation()],
                ['update', 'users', locally_updated.id(), locally_updated.dirty_wire_representation()],
                ['destroy', 'blogs', locally_destroyed.id()]
              ]
            });
          });

          context("when the request is successful", function() {
            it("finalizes all the local mutations and fires remote event callbacks", function() {
              var save_future = server.save(locally_created, locally_updated, locally_updated.blogs());

              var before_events_callback = mock_function('before_events_callback', function() {
                expect(insert_callback).to_not(have_been_called);
                expect(update_callback).to_not(have_been_called);
                expect(remove_callback).to_not(have_been_called);
              });

              var after_events_callback = mock_function('after_events_callback', function() {
                expect(insert_callback).to(have_been_called, with_args(locally_created));
                expect(update_callback).to(have_been_called, with_args(locally_updated, {
                  full_name: {
                    column: User.full_name,
                    old_value: "Jan Nelson",
                    new_value: "Francisco Wu"
                  }
                }));
                expect(remove_callback).to(have_been_called, with_args(locally_destroyed));
              });

              save_future.before_events(before_events_callback);
              save_future.after_events(after_events_callback);

              server.last_post.simulate_success({
                primary: [{ id: 'jesus', full_name: "Jesus Chang" }, { full_name: "Francisco Wu" }, null],
                secondary: []
              });

              expect(before_events_callback).to(have_been_called, once);
              expect(after_events_callback).to(have_been_called, once);

              expect(locally_created.remotely_created).to(be_true);
              expect(locally_updated.remote.full_name()).to(equal, "Francisco Wu");
              expect(Monarch.Util.contains(Blog.table.all_tuples(), locally_destroyed)).to(be_false);
            });
          });

          context("when the request is unsuccessful", function() {
            it("does not finalize any of the mutations, does not fire events, and calls the on_failure callback with the offending record", function() {
              var save_future = server.save(locally_created, locally_updated, locally_updated.blogs());

              var before_events_callback = mock_function('before_events_callback');
              var after_events_callback = mock_function('after_events_callback');
              var on_failure_callback = mock_function('on_failure_callback');
              save_future.before_events(before_events_callback);
              save_future.after_events(after_events_callback);
              save_future.on_failure(on_failure_callback);

              server.last_post.simulate_failure({ index: 1, errors: { full_name: ["That name is taken"]}});

              expect(on_failure_callback).to(have_been_called, with_args(locally_updated));

              expect(locally_created.remotely_created).to(be_false);
              expect(locally_updated.field('full_name').validation_errors).to(equal, ["That name is taken"]);
              expect(locally_updated.remote.full_name()).to(equal, "Jan Nelson");
              expect(Monarch.Util.contains(Blog.table.all_tuples(), locally_destroyed)).to(be_true);
            });
          });
        });

        context("when given only clean records", function() {
          it("does not post to the server, but still triggers before and after events callbacks", function() {
            var before_events_callback = mock_function('before_events_callback');
            var after_events_callback = mock_function('after_events_callback');
            var clean_record = User.find('jan')
            var future = server.save(clean_record, clean_record.blogs());

            future.before_events(before_events_callback);
            future.after_events(after_events_callback);

            expect(server.posts).to(be_empty);

            expect(before_events_callback).to(have_been_called, once);
            expect(after_events_callback).to(have_been_called, once);
          });
        });
      });
    });
    

    describe("request methods", function() {
      var request_method;

      scenario(".post(url, data)", function() {
        init(function() {
          request_method = 'post';
        });
      });

      scenario(".get(url, data)", function() {
        init(function() {
          request_method = 'get';
        });
      });

      scenario(".put(url, data)", function() {
        init(function() {
          request_method = 'put';
        });
      });

      scenario(".delete(url, data)", function() {
        init(function() {
          request_method = 'delete_';
        });
      });

      it("calls jQuery.ajax with the correct request type, returning an AjaxFuture whose #handle_response method is called upon receiving a response", function() {
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

        var future = server[request_method].call(server, "/users", data);

        expect(jQuery.ajax).to(have_been_called, once);

        var ajax_options = jQuery.ajax.most_recent_args[0];
        expect(ajax_options.type).to(equal, request_method.toUpperCase().replace("_", ""));
        expect(ajax_options.dataType).to(equal, 'json');

        // data is url-encoded and appended as params for delete requests
        if (request_method == "delete_") {
          var expected_data = Monarch.Util.extend({comet_client_id: window.COMET_CLIENT_ID}, data)
          expect(ajax_options.url).to(equal, '/users?' + jQuery.param(server.stringify_json_data(expected_data)));
          expect(ajax_options.data).to(be_null);
        } else {
          expect(ajax_options.url).to(equal, '/users');
          expect(JSON.parse(ajax_options.data.foo)).to(equal, data.foo);
          expect(ajax_options.data.baz).to(equal, data.baz);
          expect(JSON.parse(ajax_options.data.corge)).to(equal, data.corge);
          expect(JSON.parse(ajax_options.data.grault)).to(equal, data.grault);
        }

        expect(future.constructor).to(equal, Monarch.Http.AjaxFuture);

        mock(future, 'handle_response');

        var response_json = {
          success: true,
          data: {
            foo: "bar"
          }
        };
        ajax_options.success(response_json);
        expect(future.handle_response).to(have_been_called, with_args(response_json));
      });
    });
  });
}});
