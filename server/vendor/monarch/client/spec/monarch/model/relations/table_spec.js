//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Relations.Table", function() {
    useLocalFixtures();

    var table;
    before(function() {
      table = new Monarch.Model.Relations.Table("programmingLanguages");
    });

    describe("#defineColumn", function() {
      var column;
      before(function() {
        column = table.defineColumn("familyId", "string");
      });

      it("adds a Column with the given name and type to #columnsByName and returns it", function() {
        expect(column).to(eq, table.columnsByName.familyId);
        expect(column.constructor).to(eq, Monarch.Model.Column);
        expect(column.name).to(eq, 'familyId');
        expect(column.type).to(eq, 'string');
      });
    });

    describe("#column(name)", function() {
      it("returns the concrete or sythetic column with the given name or null if none exists", function() {
        var concreteColumn = table.defineColumn("foo", "string");
        var syntheticColumn = table.defineSyntheticColumn("bar", function() {});
        expect(table.column("foo")).to(eq, concreteColumn);
        expect(table.column("bar")).to(eq, syntheticColumn);
        expect(table.column("baz")).to(beNull);
      });
    });


    describe("#wireRepresentation", function() {
      it("contains the Table's #name and has the 'type' of 'table'", function() {
        expect(table.wireRepresentation()).to(equal, {
          type: "table",
          name: "programmingLanguages"
        });
      });
    });

    describe("delta event callback registration methods", function() {
      describe("#onInsert(callback)", function() {
        it("returns a Monarch.Subscription for the #onInsertNode", function() {
          var subscription = User.table.onInsert(mockFunction);
          expect(subscription.node).to(eq, User.table.onInsertNode);
        });
      });

      describe("#onRemove(callback)", function() {
        it("returns a Monarch.Subscription for the #onRemoveNode", function() {
          var subscription = User.table.onRemove(function() {
          });
          expect(subscription.node).to(eq, User.table.onRemoveNode);
        });
      });

      describe("#onUpdate(callback)", function() {
        it("returns a Monarch.Subscription for the #onUpdateNode", function() {
          var subscription = User.table.onUpdate(function() {
          });
          expect(subscription.node).to(eq, User.table.onUpdateNode);
        });
      });
    });

    describe("#hasSubscribers()", function() {
      context("if a callback has been registered", function() {
        scenario("with #onInsert", function() {
          before(function() {
            User.table.onInsert(mockFunction());
          });
        });

        scenario("with #onUpdate", function() {
          before(function() {
            User.table.onUpdate(mockFunction());
          });
        });

        scenario("with #onRemove", function() {
          before(function() {
            User.table.onRemove(mockFunction());
          });
        });

        scenario("with #onDirty", function() {
          before(function() {
            User.table.onDirty(mockFunction());
          });
        });

        scenario("with #onClean", function() {
          before(function() {
            User.table.onClean(mockFunction());
          });
        });

        it("returns true", function() {
          expect(User.table.hasSubscribers()).to(beTrue);
        });
      });

      context("if no callbacks have been registered", function() {
        it("returns false", function() {
          expect(User.table.hasSubscribers()).to(beFalse);
        });
      });
    });

    describe("delta callback triggering", function() {
      useLocalFixtures();

      describe("when a Record is inserted into the Table", function() {
        it("triggers #onInsert callbacks with the inserted record", function() {
          var insertCallback = mockFunction("insert callback");
          User.table.onInsert(insertCallback);

          User.create({id: "emma", fullName: "Emma Cunningham"})
            .afterEvents(function(record) {
              expect(insertCallback).to(haveBeenCalled, once);
              expect(insertCallback).to(haveBeenCalled, withArgs(record));
            });
        });
      });

      describe("when a record in the Table is removed", function() {
        it("triggers #onRemove callbacks with the removed record", function() {
          var removeCallback = mockFunction("remove callback");
          User.table.onRemove(removeCallback);

          var record = User.fixture("jan");
          User.table.remove(record);

          expect(removeCallback).to(haveBeenCalled, once);
          expect(removeCallback).to(haveBeenCalled, withArgs(record));
        });
      });

      describe("when a record in the Table is updated", function() {
        it("triggers #onUpdate callbacks with the updated record and a changed attributes object", function() {
          var updateCallback = mockFunction("update callback");
          User.table.onUpdate(updateCallback);

          var record = User.fixture("jan");

          var oldValue = record.fullName();
          var newValue = oldValue + " The Third";

          record.fullName(newValue);
          record.save();

          expect(updateCallback).to(haveBeenCalled, once);
          expect(updateCallback).to(haveBeenCalled, withArgs(record, {
            fullName: {
              column: User.fullName,
              oldValue: oldValue,
              newValue: oldValue + " The Third"
            }
          }));
        });
      });
    });

    describe("onDirty / onClean callback triggering", function() {
      useLocalFixtures();

      it("fires onDirty / onClean callbacks when a record in the table becomes dirty or clean", function() {
        var dirtyCallback = mockFunction('dirtyCallback');
        var cleanCallback = mockFunction('cleanCallback');

        User.table.onDirty(dirtyCallback);
        User.table.onClean(cleanCallback);

        var user = User.fixture('jan');
        var fullNameBefore = user.fullName();

        user.fullName("Mahatma Ghandi");
        expect(dirtyCallback).to(haveBeenCalled, withArgs(user));

        user.fullName(fullNameBefore);
        expect(cleanCallback).to(haveBeenCalled, withArgs(user));
      });
    });

    describe("onInvalid / onValid callback triggering", function() {
      useLocalFixtures();

      it("fires onInvalid / onValid callbacks when a record in the table becomes invalid or valid again", function() {
        var invalidCallback = mockFunction('invalidCallback');
        var validCallback = mockFunction('validCallback');

        User.table.onInvalid(invalidCallback);
        User.table.onValid(validCallback);

        var user = User.fixture('jan');
        user.assignValidationErrors({fullName: ["some error"]});

        expect(invalidCallback).to(haveBeenCalled, withArgs(user));

        user.clearValidationErrors();
        expect(validCallback).to(haveBeenCalled, withArgs(user));
      });
    });

    describe("#pauseEvents and #resumeEvents", function() {
      specify("#pauseEvents delays #onInsert, #onRemove, and #onUpdate triggers until #resumeEvents is called. Then delayed events are flushed and future events are no longer delayed", function() {
        var insertCallback = mockFunction("insert callback");
        var updateCallback = mockFunction("update callback");
        var removeCallback = mockFunction("remove callback");

        User.table.onInsert(insertCallback);
        User.table.onUpdate(updateCallback);
        User.table.onRemove(removeCallback);

        User.table.pauseEvents();

        var record = User.createFromRemote({id: "jake", fullName: "Jake Frautschi"});
        record.remote.update({ fullName: "Jacob Frautschi" });
        record.remotelyDestroyed();

        expect(insertCallback).toNot(haveBeenCalled);
        expect(updateCallback).toNot(haveBeenCalled);
        expect(removeCallback).toNot(haveBeenCalled);

        User.table.resumeEvents();

        expect(insertCallback).to(haveBeenCalled, withArgs(record));
        expect(updateCallback).to(haveBeenCalled, once);
        expect(updateCallback).to(haveBeenCalled, withArgs(record, {
          fullName: {
            column: User.fullName,
            oldValue: "Jake Frautschi",
            newValue: "Jacob Frautschi"
          }
        }));
        expect(removeCallback).to(haveBeenCalled, withArgs(record));

        insertCallback.clear();
        updateCallback.clear();
        removeCallback.clear();

        var record2 = User.createFromRemote({id: "nathan", fullName: "Nathan Sobo"});

        expect(insertCallback).to(haveBeenCalled, once);
        expect(insertCallback).to(haveBeenCalled, withArgs(record2));

        record2.remote.update({fullName: "Nate Sobo"});
        expect(updateCallback).to(haveBeenCalled, once);

        record2.remotelyDestroyed();
        expect(removeCallback).to(haveBeenCalled, once);
      });
    });

    describe("#evaluateInRepository(repository)", function() {
      it("returns the equivalent Table from the given repository", function() {
        var otherRepo = Repository.cloneSchema();
        var tableInOtherRepo = User.table.evaluateInRepository(otherRepo);
        expect(tableInOtherRepo).to(eq, otherRepo.tables.users);
      });
    });

    describe("#clear", function() {
      it("removes tuples data from the table and its index", function() {
        expect(User.find('jan')).toNot(beNull);
        User.table.clear();
        expect(User.table.empty()).to(beTrue);
        expect(User.find('jan')).to(beNull);
      });
    });

    describe("#fetch", function() {
      useFakeServer(false);

      context("when an id is provided", function() {
        it("fetches the record with that id", function() {
          User.table.fetch("jan");
          expect(Server.fetches.length).to(eq, 1);
          var fetchedRelation = Server.lastFetch.relations[0];
          expect(fetchedRelation.isEqual(User.where({id: "jan"}))).to(beTrue);
        });
      });

      context("when no id is provided", function() {
        it("fetches the entire table", function() {
          User.table.fetch();
          expect(Server.fetches.length).to(eq, 1);
          var fetchedRelation = Server.lastFetch.relations[0];
          expect(fetchedRelation).to(eq, User.table);
        });
      });
    });

    describe("#findOrFetch(id, additionalRelations)", function() {
      useFakeServer(false);

      it("looks for a record in with the given id, and fetches it and any additional relations if it is not found, invoking the callback with the record", function() {
        // case where a record with given id is in the repo
        var extantRecord = Blog.find("recipes");

        var onSuccessCallback = mockFunction("onSuccessCallback");
        Blog.findOrFetch("recipes").onSuccess(onSuccessCallback);

        expect(onSuccessCallback).to(haveBeenCalled, once);
        expect(onSuccessCallback).to(haveBeenCalled, withArgs(extantRecord));
        expect(Server.fetches).to(beEmpty);

        // case where a record with that id is not in the local repo
        onSuccessCallback.clear();

        var additionalRelation = BlogPost.where({blogId: "on-server"});
        Blog.findOrFetch("on-server", [additionalRelation]).onSuccess(onSuccessCallback);

        expect(onSuccessCallback).toNot(haveBeenCalled);
        expect(Server.fetches.length).to(eq, 1);
        expect(Server.lastFetch.relations).to(equal, [Blog.where({id: "on-server"}), additionalRelation]);

        Server.lastFetch.simulateSuccess({
          blogs: {
            'on-server': { id: "on-server", name: "Fetched From The Server"}
          }
        });

        expect(onSuccessCallback).to(haveBeenCalled, once);
        expect(onSuccessCallback).to(haveBeenCalled, withArgs(Blog.find('on-server')));
      });
    });

  });
}});
