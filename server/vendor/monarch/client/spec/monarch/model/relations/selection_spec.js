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

    describe("#onInsert", function() {
      it("returns a Monarch.Subscription with #onInsertNode as its #node", function() {
        var subscription = selection.onInsert(function() {});
        expect(subscription.node).to(eq, selection.onInsertNode);
      });
    });

    describe("#onRemove", function() {
      it("returns a Monarch.Subscription with #onRemoveNode as its #node", function() {
        var subscription = selection.onRemove(function() {});
        expect(subscription.node).to(eq, selection.onRemoveNode);
      });
    });

    describe("#onUpdate", function() {
      it("returns a Monarch.Subscription with #onUpdateNode as its #node", function() {
        var subscription = selection.onUpdate(function() {});
        expect(subscription.node).to(eq, selection.onUpdateNode);
      });
    });

    describe("#hasSubscribers", function() {
      context("if a callback has been registered with #onInsert", function() {
        it("returns true", function() {
          selection.onInsert(function() {});
          expect(selection.hasSubscribers()).to(beTrue);
        });
      });

      context("if a callback has been registered with #onRemove", function() {
        it("returns true", function() {
          selection.onRemove(function() {});
          expect(selection.hasSubscribers()).to(beTrue);
        });
      });

      context("if a callback has been registered with #onUpdate", function() {
        it("returns true", function() {
          selection.onUpdate(function() {});
          expect(selection.hasSubscribers()).to(beTrue);
        });
      });

      context("if no callbacks have been registered", function() {
        it("returns false", function() {
          expect(selection.hasSubscribers()).to(beFalse);
        });
      });
    });

    describe("event handling", function() {
      var insertCallback, removeCallback, updateCallback, tuple;
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
      });

      context("when a record is inserted in the Selection's #operand remotely", function() {
        context("when that record matches #predicate", function() {
          it("triggers #onInsert callbacks with the inserted record", function() {
            User.create({id: "joe", age: 31})
              .afterEvents(function(record) {
                expect(predicate.evaluate(record)).to(beTrue);
                expect(insertCallback).to(haveBeenCalled, withArgs(record));
              });
          });
        });

        context("when that record does not match #predicate", function() {
          it("does not trigger #onInsert callbacks", function() {
            User.create({id: "mike", age: 22})
              .afterEvents(function(record) {
                expect(predicate.evaluate(record)).to(beFalse);
                expect(insertCallback).toNot(haveBeenCalled);
              });
          });
        });
      });

      context("when a record is removed from the Selection's #operand remotely", function() {
        context("when that record matches #predicate", function() {
          it("triggers #onRemove callbacks with the removed record", function() {
            var record = operand.find("jan");
            expect(predicate.evaluate(record)).to(beTrue);

            operand.remove(record)

            expect(removeCallback).to(haveBeenCalled, withArgs(record));
          });
        });

        context("when that record does not match #predicate", function() {
          var record;
          before(function() {
            record = operand.find("mike");
            expect(predicate.evaluate(record)).to(beFalse);
          });

          it("does not trigger #onRemove callbacks and continues to not #contain the removed record", function() {
            expect(selection.contains(record)).to(beFalse);
            operand.remove(record);
            expect(selection.contains(record)).to(beFalse);
            expect(removeCallback).toNot(haveBeenCalled);
          });
        });
      });

      context("when a record in the selection's #operand is updated remotely", function() {
        context("when that record matched #predicate before the update", function() {
          var record;
          before(function() {
            record = operand.find("jan");
            expect(predicate.evaluate(record)).to(beTrue);
          });

          context("when that record matches #predicate after the update", function() {
            it("does not trigger #onInsert callbacks", function() {
              record.fullName("Janford Nelsan");
              expect(predicate.evaluate(record)).to(beTrue);
              expect(insertCallback).toNot(haveBeenCalled);
            });

            it("does not trigger #onRemove callbacks", function() {
              record.fullName("Janford Nelsan");
              expect(predicate.evaluate(record)).to(beTrue);
              expect(removeCallback).toNot(haveBeenCalled);
            });

            it("triggers #onUpdate callbacks with the updated record and a change object and continues to #contain the record", function() {
              var oldValue = record.fullName();
              var newValue = "Janand Nelson";

              expect(selection.contains(record)).to(beTrue);
              record.fullName(newValue);
              record.save();
              expect(selection.contains(record)).to(beTrue);
              
              expect(predicate.evaluate(record)).to(beTrue);

              expect(updateCallback).to(haveBeenCalled, once);

              var updatedRecord = updateCallback.mostRecentArgs[0];
              var updatedAttributes = updateCallback.mostRecentArgs[1];
              expect(updatedRecord).to(eq, record);
              expect(updatedAttributes.fullName.column).to(eq, User.fullName);
              expect(updatedAttributes.fullName.oldValue).to(eq, oldValue);
              expect(updatedAttributes.fullName.newValue).to(eq, newValue);
            });
          });

          context("when that record does not match #predicate after the update", function() {
            it("does not trigger #onInsert callbacks", function() {
              record.update({age: 34});
              expect(predicate.evaluate(record)).to(beFalse);
              expect(insertCallback).toNot(haveBeenCalled);
            });

            it("triggers #onRemove callbacks to be invoked with the updated record", function() {
              record.update({age: 34});
              expect(predicate.evaluate(record)).to(beFalse);
              expect(removeCallback).to(haveBeenCalled, withArgs(record));
            });

            it("does not trigger #onUpdate callbacks", function() {
              record.update({age: 34});
              expect(predicate.evaluate(record)).to(beFalse);
              expect(updateCallback).toNot(haveBeenCalled);
            });

            it("does not #contain the updated record before the #onRemove callbacks are triggered", function() {
              var onRemoveCallback = mockFunction('onRemoveCallback', function() {
                expect(selection.contains(record)).to(beFalse);
              });
              selection.onRemove(onRemoveCallback);

              expect(selection.contains(record)).to(beTrue);
              record.update({age: 34});
              expect(onRemoveCallback).to(haveBeenCalled);
            });
          });
        });

        context("when that record did not match #predicate before the update", function() {
          before(function() {
            record = operand.find("mike");
            expect(predicate.evaluate(record)).to(beFalse);
          });

          context("when that record matches #predicate after the update", function() {
            it("triggers #onInsert callbacks with the updated record", function() {
              record.update({age: 31});
              expect(predicate.evaluate(record)).to(beTrue);
              expect(insertCallback).to(haveBeenCalled);
            });

            it("does not trigger #onRemove callbacks", function() {
              record.update({age: 31});
              expect(predicate.evaluate(record)).to(beTrue);
              expect(removeCallback).toNot(haveBeenCalled);
            });

            it("does not trigger #onUpdate callbacks", function() {
              record.update({age: 31});
              expect(predicate.evaluate(record)).to(beTrue);
              expect(updateCallback).toNot(haveBeenCalled);
            });

            it("#contains the record before #onInsert callbacks are fired", function() {
              var onInsertCallback = mockFunction('onInsertCallback', function(record) {
                expect(selection.contains(record)).to(beTrue);
              });
              selection.onInsert(onInsertCallback);

              expect(selection.contains(record)).to(beFalse);
              record.update({age: 31});
              expect(onInsertCallback).to(haveBeenCalled);
            });
          });

          context("when that record does not match #predicate after the update", function() {
            it("does not cause #onInsert callbacks to be invoked with the updated record", function() {
              record.fullName("JarJar Nelson");
              expect(predicate.evaluate(record)).to(beFalse);
              expect(insertCallback).toNot(haveBeenCalled);
            });

            it("does not cause #onRemove callbacks to be invoked with the updated record", function() {
              record.fullName("JarJar Nelson");
              expect(predicate.evaluate(record)).to(beFalse);
              expect(removeCallback).toNot(haveBeenCalled);
            });
            
            it("does not trigger #onUpdate callbacks", function() {
              record.fullName("JarJar Nelson");
              expect(predicate.evaluate(record)).to(beFalse);
              expect(updateCallback).toNot(haveBeenCalled);
            });

            it("continues to not #contain the record", function() {
              expect(selection.contains(record)).to(beFalse);
              record.fullName("JarJar Nelson");
              expect(selection.contains(record)).to(beFalse);
            });
          });
        });
      });
      
      context("when a record is made dirty or clean in the selection's operand", function() {
        var dirtyCallback, cleanCallback;
        before(function() {
          dirtyCallback = mockFunction('dirtyCallback');
          cleanCallback = mockFunction('cleanCallback');
          selection.onDirty(dirtyCallback);
          selection.onDirty(cleanCallback);
        });

        context("when the record matches the selection's predicate", function() {
          it("triggers onDirty / onClean callbacks on the selection", function() {
            var record = selection.first();
            var ageBefore = record.age();
            record.age(555);
            expect(dirtyCallback).to(haveBeenCalled, withArgs(record));
            record.age(ageBefore);
            expect(cleanCallback).to(haveBeenCalled, withArgs(record));
          });
        });

        context("when the record does not match the selection's predicate", function() {
          it("does not trigger onDirty / onClean callbacks on the selection", function() {
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
        var invalidCallback, validCallback;
        before(function() {
          invalidCallback = mockFunction('invalidCallback');
          validCallback = mockFunction('validCallback');
          selection.onInvalid(invalidCallback);
          selection.onValid(validCallback);
        });

        context("when the record matches the selection's predicate", function() {
          it("triggers onValid / onInvalid callbacks on the selection", function() {
            var record = selection.first();
            record.assignValidationErrors({age: ["too young!"]});
            expect(invalidCallback).to(haveBeenCalled, withArgs(record));
            record.clearValidationErrors();
            expect(validCallback).to(haveBeenCalled, withArgs(record));
          });
        });

        context("when the record does not match the selection's predicate", function() {
          it("does not trigger onDirty / onClean callbacks on the selection", function() {
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

    describe("subscription propagation", function() {
      describe("when a subscription is registered for the selection, destroyed, and another subscription is registered", function() {
        var eventType;

        scenario("for onInsert callbacks", function() {
          init(function() {
            eventType = "onInsert";
          });
        });

        scenario("for onUpdate callbacks", function() {
          init(function() {
            eventType = "onUpdate";
          });
        });

        scenario("for onRemove callbacks", function() {
          init(function() {
            eventType = "onRemove";
          });
        });

        scenario("for onClean callbacks", function() {
          init(function() {
            eventType = "onClean";
          });
        });

        scenario("for onDirty callbacks", function() {
          init(function() {
            eventType = "onDirty";
          });
        });

        it("subscribes to its #operand and memoizes tuples, then unsubscribes and clears the memoization, then resubscribes and rememoizes", function() {
          expect(operand.hasSubscribers()).to(beFalse);
          expect(selection._tuples).to(beNull);

          var subscription = selection[eventType].call(selection, function() {});

          expect(operand.hasSubscribers()).to(beTrue);
          expect(selection._tuples).toNot(beNull);

          subscription.destroy();

          expect(operand.hasSubscribers()).to(beFalse);
          expect(selection._tuples).to(beNull);

          selection.onUpdate(function() {});

          expect(operand.hasSubscribers()).to(beTrue);
          expect(selection._tuples).toNot(beNull);
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

    describe("#isEqual", function() {
      it("structurally compares the selection with other relations", function() {
        expect(User.where({fullName: "Joe"}).isEqual(User.where({fullName: "Joe"}))).to(beTrue);
        expect(User.where({fullName: "Joe"}).isEqual(User.where({fullName: "Bob"}))).to(beFalse);
        expect(User.where({fullName: "Joe"}).isEqual(User.table)).to(beFalse);
      });
    });
  });
}});
