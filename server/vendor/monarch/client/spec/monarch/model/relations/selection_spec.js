//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Relations.Selection", function() {
    useLocalFixtures();
    
    var selection, operand, predicate;

    before(function() {
      operand = User.table;
      predicate = new Monarch.Model.Predicates.Eq(User.age, 31);
      selection = new Monarch.Model.Relations.Selection(operand, predicate);
    });

    describe("#tuples", function() {
      it("returns only the #tuples of #operand that match #predicate", function() {
        var expectedTuples = [];
        var operandTuples = operand.tuples();

        var expectedTuples = _.filter(operand.tuples(), function(tuple) {
          return predicate.evaluate(tuple);
        });

        expect(expectedTuples).toNot(beEmpty);
        expect(selection.tuples()).to(equal, expectedTuples);
      });
    });

    describe("#create", function() {
      before(function() {
        Server.auto = false;
      });

      it("calls #create on its operand with the given attributes extended with an attribute value that satisfies the predicate", function() {
        var createFuture = selection.create({fullName: "John Lennon"});
        expect(Server.creates.length).to(eq, 1);

        var createCallback = mockFunction('create callback', function(record) {
          expect(record.age()).to(eq, 31);
          expect(record.fullName()).to(eq, "John Lennon");
        });
        createFuture.afterEvents(createCallback);

        Server.creates.shift().simulateSuccess();

        expect(createCallback).to(haveBeenCalled);
      });

      context("if called with no arguments", function() {
        it("still introduces the necessary field values in a call to #create on its operand", function() {
          mock(operand, 'create');
          selection.create();
          expect(operand.create).to(haveBeenCalled, withArgs({age: 31}));
        });
      });
    });

    describe("#wireRepresentation", function() {
      it("returns the JSON representation of the Selection", function() {
        expect(selection.wireRepresentation()).to(equal, {
          type: "selection",
          operand: {
            type: "table",
            name: "users"
          },
          predicate: {
            type: "eq",
            left_operand: {
              type: "column",
              table: "users",
              name: "age"
            },
            right_operand: {
              type: "scalar",
              value: 31
            }
          }
        });
      });
    });

    describe("#isEqual", function() {
      it("structurally compares the selection with other relations", function() {
        expect(User.where({fullName: "Joe"}).isEqual(User.where({fullName: "Joe"}))).to(beTrue);
        expect(User.where({fullName: "Joe"}).isEqual(User.where({fullName: "Bob"}))).to(beFalse);
        expect(User.where({fullName: "Joe"}).isEqual(User.table)).to(beFalse);
      });
    });

    describe("event handling", function() {
      var insertCallback, removeCallback, updateCallback, dirtyCallback, cleanCallback, invalidCallback, validCallback;;

      before(function() {
        insertCallback = mockFunction("insert callback", function(record) {
          expect(selection.contains(record)).to(beTrue);
        });
        selection.onInsert(insertCallback);

        removeCallback = mockFunction("remove callback", function(record) {
          expect(selection.contains(record)).to(beFalse);
        });
        selection.onRemove(removeCallback);

        updateCallback = mockFunction("update callback");
        selection.onUpdate(updateCallback);

        dirtyCallback = mockFunction('dirtyCallback');
        selection.onDirty(dirtyCallback);

        cleanCallback = mockFunction('cleanCallback');
        selection.onClean(cleanCallback);

        invalidCallback = mockFunction('invalidCallback');
        selection.onInvalid(invalidCallback);

        validCallback = mockFunction('validCallback');
        selection.onValid(validCallback);
      });

      context("when a record is inserted into the selection's operand", function() {
        context("when that record matches the predicate", function() {
          it("triggers an insert event with the record", function() {
            var record = User.createFromRemote({id: "joe", age: 31});
            expect(predicate.evaluate(record)).to(beTrue);
            expect(insertCallback).to(haveBeenCalled, withArgs(record));
          });
        });

        context("when that record does not match the predicate", function() {
          it("does not an trigger insert event", function() {
            var record = User.createFromRemote({id: "mike", age: 22});
            expect(predicate.evaluate(record)).to(beFalse);
            expect(insertCallback).toNot(haveBeenCalled);
          });
        });
      });

      context("when a record is removed from the selection's operand", function() {
        context("when that record matches the predicate", function() {
          it("triggers a remove event with the record", function() {
            var record = selection.first();
            record.remotelyDestroyed();
            expect(removeCallback).to(haveBeenCalled, withArgs(record));
          });
        });

        context("when that record does not match the predicate", function() {
          it("does not trigger #onRemove callbacks and continues to not #contain the removed record", function() {
            var record = operand.find("mike");
            expect(predicate.evaluate(record)).to(beFalse);
            record.remotelyDestroyed();
            expect(removeCallback).toNot(haveBeenCalled);
          });
        });
      });

      context("when a record in the selection's operand is updated", function() {
        var record;

        context("when the record matched the predicate before the update", function() {
          before(function() {
            record = selection.first();
          });

          context("when the record matches the predicate after the update", function() {
            it("triggers an insert event with the updated record", function() {
              var oldName = record.fullName();
              var newName = "Bing Crosby";

              expect(selection.contains(record)).to(beTrue);
              record.remotelyUpdated({fullName: newName});
              expect(selection.contains(record)).to(beTrue);
              
              expect(updateCallback).to(haveBeenCalled, withArgs(record, {
                fullName: {
                  column: User.fullName,
                  oldValue: oldName,
                  newValue: newName
                }
              }));

              expect(insertCallback).toNot(haveBeenCalled);
              expect(removeCallback).toNot(haveBeenCalled);
            });
          });

          context("when the record no longer matches the predicate after the update", function() {
            it("triggers a remove event with the updated record", function() {
              record.remotelyUpdated({age: 34});
              expect(predicate.evaluate(record)).to(beFalse);
              expect(selection.contains(record)).to(beFalse);
              expect(removeCallback).to(haveBeenCalled, withArgs(record));
            });
          });
        });

        context("when the record did not match the predicate before the update", function() {
          before(function() {
            record = operand.find("mike");
            expect(predicate.evaluate(record)).to(beFalse);
          });

          context("when the record matches the predicate after the update", function() {
            it("triggers an insert event with the updated record", function() {
              record.update({age: 31});
              expect(predicate.evaluate(record)).to(beTrue);
              expect(selection.contains(record)).to(beTrue);
              expect(insertCallback).to(haveBeenCalled, withArgs(record));
            });
          });

          context("when the record still does not match the predicate after the update", function() {
            it("does not trigger any events", function() {
              record.fullName("JarJar Bin Ladel");
              expect(predicate.evaluate(record)).to(beFalse);
              expect(insertCallback).toNot(haveBeenCalled);
              expect(removeCallback).toNot(haveBeenCalled);
              expect(updateCallback).toNot(haveBeenCalled);
            });
          });
        });
      });
      
      context("when a record is made dirty or clean in the selection's operand", function() {
        context("when the record matches the selection's predicate", function() {
          it("triggers dirty and clean events", function() {
            var record = selection.first();
            var ageBefore = record.age();
            record.age(555);
            expect(dirtyCallback).to(haveBeenCalled, withArgs(record));
            record.age(ageBefore);
            expect(cleanCallback).to(haveBeenCalled, withArgs(record));
          });
        });

        context("when the record does not match the selection's predicate", function() {
          it("does not trigger dirty or clean events", function() {
            var record = User.fixture('mike');
            expect(selection.contains(record)).to(beFalse);
            var fullNameBefore = record.fullName();
            record.fullName("Igor Smith");
            expect(dirtyCallback).toNot(haveBeenCalled);
            record.fullName(fullNameBefore);
            expect(cleanCallback).toNot(haveBeenCalled);
          });
        });
      });

      context("when a record is made invalid or valid in the selection's operand", function() {
        context("when the record matches the selection's predicate", function() {
          it("triggers valid and invalid events", function() {
            var record = selection.first();
            record.assignValidationErrors({age: ["too young!"]});
            expect(invalidCallback).to(haveBeenCalled, withArgs(record));
            record.clearValidationErrors();
            expect(validCallback).to(haveBeenCalled, withArgs(record));
          });
        });

        context("when the record does not match the selection's predicate", function() {
          it("does not trigger valid or invalid events", function() {
            var record = User.fixture('mike');
            expect(selection.contains(record)).to(beFalse);
            record.assignValidationErrors({age: ["too young!"]});
            expect(invalidCallback).toNot(haveBeenCalled);
            record.clearValidationErrors();
            expect(validCallback).toNot(haveBeenCalled);
          });
        });
      });
    });

    describe("#evaluateInRepository(repository)", function() {
      it("returns the same selection with its operand evaluated in the repository", function() {
        var otherRepo = Repository.cloneSchema();
        var selectionInOtherRepo = selection.evaluateInRepository(otherRepo);

        expect(selectionInOtherRepo.operand).to(eq, selection.operand.evaluateInRepository(otherRepo));
        expect(selectionInOtherRepo.predicate).to(eq, selection.predicate);

        var tableInOtherRepo = User.table.evaluateInRepository(otherRepo);
        expect(tableInOtherRepo).to(eq, otherRepo.tables.users);
      });
    });
  });
}});
