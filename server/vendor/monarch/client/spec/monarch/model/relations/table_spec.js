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
        expect(column).to(equal, table.columnsByName.familyId);
        expect(column.constructor).to(equal, Monarch.Model.Column);
        expect(column.name).to(equal, 'familyId');
        expect(column.type).to(equal, 'string');
      });
    });

    describe("query methods", function() {
      var locallyCreated, locallyUpdated, locallyDestroyed, cleanRecord;
      before(function() {
        cleanRecord = User.find('mike');
        locallyCreated = User.localCreate({ id: 'barbara' });
        locallyUpdated = User.find('wil');
        locallyUpdated.localUpdate({fullName: "Kaiser Wilhelm"});
        locallyDestroyed = User.find('jan');
        locallyDestroyed.localDestroy();
      });

      describe("#allTuples", function() {
        it("returns a copy of all records in the table, including those that are locally created and destroyed", function() {
          var tuples = User.table.allTuples();

          expect(Monarch.Util.contains(tuples, cleanRecord)).to(beTrue);
          expect(Monarch.Util.contains(tuples, locallyUpdated)).to(beTrue);
          expect(Monarch.Util.contains(tuples, locallyCreated)).to(beTrue);
          expect(Monarch.Util.contains(tuples, locallyDestroyed)).to(beTrue);

          tuples.push(1);
          expect(User.table.allTuples()).toNot(equal, tuples);
        });
      });

      describe("#localTuples", function() {
        it("excludes records that are locally destroyed but includes all others", function() {
          var tuples = User.table.localTuples();

          expect(Monarch.Util.contains(tuples, locallyDestroyed)).to(beFalse);
          expect(Monarch.Util.contains(tuples, cleanRecord)).to(beTrue);
          expect(Monarch.Util.contains(tuples, locallyUpdated)).to(beTrue);
          expect(Monarch.Util.contains(tuples, locallyCreated)).to(beTrue);
        });
      });

      describe("#dirtyTuples", function() {
        it("excludes clean records but includes all others", function() {
          var tuples = User.table.dirtyTuples();

          expect(Monarch.Util.contains(tuples, cleanRecord)).to(beFalse);
          expect(Monarch.Util.contains(tuples, locallyCreated)).to(beTrue);
          expect(Monarch.Util.contains(tuples, locallyUpdated)).to(beTrue);
          expect(Monarch.Util.contains(tuples, locallyDestroyed)).to(beTrue);
        });
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
      describe("#onRemoteInsert(callback)", function() {
        it("returns a Monarch.Subscription for the #onRemoteInsertNode", function() {
          var subscription = User.table.onRemoteInsert(mockFunction);
          expect(subscription.node).to(equal, User.table.onRemoteInsertNode);
        });
      });

      describe("#onRemoteRemove(callback)", function() {
        it("returns a Monarch.Subscription for the #onRemoteRemoveNode", function() {
          var subscription = User.table.onRemoteRemove(function() {
          });
          expect(subscription.node).to(equal, User.table.onRemoteRemoveNode);
        });
      });

      describe("#onRemoteUpdate(callback)", function() {
        it("returns a Monarch.Subscription for the #onRemoteUpdateNode", function() {
          var subscription = User.table.onRemoteUpdate(function() {
          });
          expect(subscription.node).to(equal, User.table.onRemoteUpdateNode);
        });
      });
    });

    describe("#hasSubscribers()", function() {
      context("if a callback has been registered", function() {
        scenario("with #onRemoteInsert", function() {
          before(function() {
            User.table.onRemoteInsert(mockFunction());
          });
        });

        scenario("with #onRemoteUpdate", function() {
          before(function() {
            User.table.onRemoteUpdate(mockFunction());
          });
        });

        scenario("with #onRemoteRemove", function() {
          before(function() {
            User.table.onRemoteRemove(mockFunction());
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
        it("triggers #onRemoteInsert callbacks with the inserted record", function() {
          var insertCallback = mockFunction("insert callback");
          User.table.onRemoteInsert(insertCallback);

          User.create({id: "emma", fullName: "Emma Cunningham"})
            .afterEvents(function(record) {
              expect(insertCallback).to(haveBeenCalled, once);
              expect(insertCallback).to(haveBeenCalled, withArgs(record));
            });
        });
      });

      describe("when a record in the Table is removed", function() {
        it("triggers #onRemoteRemove callbacks with the removed record", function() {
          var removeCallback = mockFunction("remove callback");
          User.table.onRemoteRemove(removeCallback);

          var record = User.find("jan");
          User.table.remove(record);

          expect(removeCallback).to(haveBeenCalled, once);
          expect(removeCallback).to(haveBeenCalled, withArgs(record));
        });
      });

      describe("when a record in the Table is updated", function() {
        it("triggers #onRemoteUpdate callbacks with the updated record and a changed attributes object", function() {
          var updateCallback = mockFunction("update callback");
          User.table.onRemoteUpdate(updateCallback);

          var record = User.find("jan");

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

    describe("dirty / clean callback triggering", function() {
      useLocalFixtures();

      it("fires dirty / clean callbacks when a record in the table becomes dirty or clean", function() {
        var dirtyCallback = mockFunction('dirtyCallback');
        var cleanCallback = mockFunction('cleanCallback');

        User.table.onDirty(dirtyCallback);
        User.table.onClean(cleanCallback);

        var user = User.find('jan');
        var fullNameBefore = user.fullName();

        user.fullName("Mahatma Ghandi");
        expect(dirtyCallback).to(haveBeenCalled, withArgs(user));

        user.fullName(fullNameBefore);
        expect(cleanCallback).to(haveBeenCalled, withArgs(user));
      });
    });

    describe("#pauseEvents and #resumeEvents", function() {
      specify("#pauseEvents delays #onRemoteInsert, #onRemoteRemove, and #onRemoteUpdate triggers until #resumeEvents is called. Then delayed events are flushed and future events are no longer delayed", function() {
        var insertCallback = mockFunction("insert callback");
        var updateCallback = mockFunction("update callback");
        var removeCallback = mockFunction("remove callback");

        User.table.onRemoteInsert(insertCallback);
        User.table.onRemoteUpdate(updateCallback);
        User.table.onRemoteRemove(removeCallback);

        User.table.pauseEvents();

        var record = User.localCreate({id: "jake", fullName: "Jake Frautschi"});
        record.remotelyCreated({id: "jake", fullName: "Jake Frautschi"});
        record.remote.update({ fullName: "Jacob Frautschi" });
        record.localDestroy();
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

        var record2 = User.localCreate({id: "nathan", fullName: "Nathan Sobo"});
        record2.remotelyCreated({id: "nathan", fullName: "Nathan Sobo"});

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
        expect(tableInOtherRepo).to(equal, otherRepo.tables.users);
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
  });
}});
