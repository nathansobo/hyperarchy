//= require monarch_spec_helper

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
        createFuture.success(createCallback);

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
      var insertCallback, removeCallback, updateCallback, dirtyCallback, cleanCallback, invalidCallback, validCallback;
      var includedRecord1, includedRecord2, excludedRecord;

      before(function() {
        User.clear();
        includedRecord1 = User.createFromRemote({id: 1, age: 31});
        includedRecord2 = User.createFromRemote({id: 2, age: 31});
        excludedRecord = User.createFromRemote({id: 3, age: 99});

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
            var record = User.createFromRemote({id: 100, age: 31});
            var sortKey = User.table.buildSortKey(record);

            expect(predicate.evaluate(record)).to(beTrue);
            expect(insertCallback).to(haveBeenCalled, withArgs(record, 2, sortKey, sortKey));
          });
        });

        context("when that record does not match the predicate", function() {
          it("does not an trigger insert event", function() {
            var record = User.createFromRemote({id: 100, age: 22});
            expect(predicate.evaluate(record)).to(beFalse);
            expect(insertCallback).toNot(haveBeenCalled);
          });
        });
      });

      context("when a record is removed from the selection's operand", function() {
        context("when that record matches the predicate", function() {
          it("triggers a remove event with the record", function() {
            var record = selection.first();
            var sortKey = selection.buildSortKey(record);
            record.remotelyDestroyed();
            expect(removeCallback).to(haveBeenCalled, withArgs(record, 0, sortKey, sortKey));
          });
        });

        context("when that record does not match the predicate", function() {
          it("does not trigger #onRemove callbacks and continues to not #contain the removed record", function() {
            expect(predicate.evaluate(excludedRecord)).to(beFalse);
            excludedRecord.remotelyDestroyed();
            expect(removeCallback).toNot(haveBeenCalled);
          });
        });
      });

      context("when a record in the selection's operand is updated", function() {
        context("when the record matched the predicate before the update", function() {
          context("when the record matches the predicate after the update", function() {

            it("triggers an update event with the updated record", function() {
              var record = selection.first();

              // change the id to test change to the sort index, even though ids usually aren't updated
              var oldId = record.id();

              expect(selection.contains(record)).to(beTrue);
              record.remotelyUpdated({id: 100});
              expect(selection.contains(record)).to(beTrue);

              // fired with record, changeset, new index, old index, new sort key, old sort key
              expect(updateCallback).to(haveBeenCalled, withArgs(record, {
                id: {
                  column: User.id,
                  oldValue: oldId,
                  newValue: 100
                }
              }, 1, 0, {'users.id': 100}, {'users.id': oldId}));

              expect(insertCallback).toNot(haveBeenCalled);
              expect(removeCallback).toNot(haveBeenCalled);
            });
          });

          context("when the record no longer matches the predicate after the update", function() {
            it("triggers a remove event with the updated record", function() {
              // change the id to ensure we locate the record correctly with the old sort key
              var oldId = includedRecord2.id();
              includedRecord2.remotelyUpdated({age: 34, id: 100});
              expect(predicate.evaluate(includedRecord2)).to(beFalse);
              expect(selection.contains(includedRecord2)).to(beFalse);
              expect(removeCallback).to(haveBeenCalled, withArgs(includedRecord2), 1, {'users.id': 100}, {'users.id': oldId});
            });
          });
        });

        context("when the record did not match the predicate before the update", function() {
          before(function() {
            expect(predicate.evaluate(excludedRecord)).to(beFalse);
          });

          context("when the record matches the predicate after the update", function() {
            it("triggers an insert event with the updated record", function() {
              // change the id to ensure we pass the new and old sort key
              var oldId = excludedRecord.id();
              excludedRecord.update({age: 31, id: 100});
              expect(predicate.evaluate(excludedRecord)).to(beTrue);
              expect(selection.contains(excludedRecord)).to(beTrue);
              expect(insertCallback).to(haveBeenCalled, withArgs(excludedRecord, 2, {'users.id': 100}, {'users.id': oldId}));
            });
          });

          context("when the record still does not match the predicate after the update", function() {
            it("does not trigger any events", function() {
              excludedRecord.fullName("JarJar Bin Ladel");
              expect(predicate.evaluate(excludedRecord)).to(beFalse);
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
            var sortKey = selection.buildSortKey(record);
            var ageBefore = record.age();
            record.age(555);
            expect(dirtyCallback).to(haveBeenCalled, withArgs(record, 0, sortKey, sortKey));
            record.age(ageBefore);
            expect(cleanCallback).to(haveBeenCalled, withArgs(record, 0, sortKey, sortKey));
          });
        });

        context("when the record does not match the selection's predicate", function() {
          it("does not trigger dirty or clean events", function() {
            var record = excludedRecord;
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
            var sortKey = selection.buildSortKey(record);
            record.assignValidationErrors({age: ["too young!"]});
            expect(invalidCallback).to(haveBeenCalled, withArgs(record, 0, sortKey, sortKey));
            record.clearValidationErrors();
            expect(validCallback).to(haveBeenCalled, withArgs(record, 0, sortKey, sortKey));
          });
        });

        context("when the record does not match the selection's predicate", function() {
          it("does not trigger valid or invalid events", function() {
            var record = excludedRecord;
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
