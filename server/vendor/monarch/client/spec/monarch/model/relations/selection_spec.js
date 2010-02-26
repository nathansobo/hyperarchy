//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Relations.Selection", function() {
    use_local_fixtures();
    
    var selection, operand, predicate;

    before(function() {
      operand = User.table;
      predicate = new Monarch.Model.Predicates.Eq(User.age, 31);
      selection = new Monarch.Model.Relations.Selection(operand, predicate);
    });

    describe("#all_tuples", function() {
      it("returns only the #tuples of #operand that match #predicate", function() {
        var expected_tuples = [];
        var operand_tuples = operand.tuples();

        var expected_tuples = Monarch.Util.select(operand.all_tuples(), function(tuple) {
          return predicate.evaluate(tuple);
        });

        expect(expected_tuples).to_not(be_empty);
        expect(selection.all_tuples()).to(equal, expected_tuples);
      });
    });

    describe("#create", function() {
      before(function() {
        Server.auto = false;
      });

      it("calls #create on its operand with the given attributes extended with an attribute value that satisfies the predicate", function() {
        var create_future = selection.create({full_name: "John Lennon"});
        expect(Server.creates.length).to(equal, 1);

        var create_callback = mock_function('create callback', function(record) {
          expect(record.age()).to(equal, 31);
          expect(record.full_name()).to(equal, "John Lennon");
        });
        create_future.after_events(create_callback);

        Server.creates.shift().simulate_success();

        expect(create_callback).to(have_been_called);
      });

      context("if called with no arguments", function() {
        it("still introduces the necessary field values in a call to #create on its operand", function() {
          mock(operand, 'create');
          selection.create();
          expect(operand.create).to(have_been_called, with_args({age: 31}));
        });
      });
    });

    describe("#wire_representation", function() {
      it("returns the JSON representation of the Selection", function() {
        expect(selection.wire_representation()).to(equal, {
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

    describe("#on_remote_insert", function() {
      it("returns a Monarch.Subscription with #on_remote_insert_node as its #node", function() {
        var subscription = selection.on_remote_insert(function() {});
        expect(subscription.node).to(equal, selection.on_remote_insert_node);
      });
    });

    describe("#on_remote_remove", function() {
      it("returns a Monarch.Subscription with #on_remote_remove_node as its #node", function() {
        var subscription = selection.on_remote_remove(function() {});
        expect(subscription.node).to(equal, selection.on_remote_remove_node);
      });
    });

    describe("#on_remote_update", function() {
      it("returns a Monarch.Subscription with #on_remote_update_node as its #node", function() {
        var subscription = selection.on_remote_update(function() {});
        expect(subscription.node).to(equal, selection.on_remote_update_node);
      });
    });

    describe("#has_subscribers", function() {
      context("if a callback has been registered with #on_remote_insert", function() {
        it("returns true", function() {
          selection.on_remote_insert(function() {});
          expect(selection.has_subscribers()).to(be_true);
        });
      });

      context("if a callback has been registered with #on_remote_remove", function() {
        it("returns true", function() {
          selection.on_remote_remove(function() {});
          expect(selection.has_subscribers()).to(be_true);
        });
      });

      context("if a callback has been registered with #on_remote_update", function() {
        it("returns true", function() {
          selection.on_remote_update(function() {});
          expect(selection.has_subscribers()).to(be_true);
        });
      });

      context("if no callbacks have been registered", function() {
        it("returns false", function() {
          expect(selection.has_subscribers()).to(be_false);
        });
      });
    });

    describe("event handling", function() {
      var insert_callback, remove_callback, update_callback, tuple;
      before(function() {
        insert_callback = mock_function("insert callback", function(record) {
          expect(selection.contains(record)).to(be_true);
        });
        selection.on_remote_insert(insert_callback);

        remove_callback = mock_function("remove callback", function(record) {
          expect(selection.contains(record)).to(be_false);
        });
        selection.on_remote_remove(remove_callback);

        update_callback = mock_function("update callback");
        selection.on_remote_update(update_callback);
      });

      context("when a record is inserted in the Selection's #operand remotely", function() {
        context("when that record matches #predicate", function() {
          it("triggers #on_remote_insert callbacks with the inserted record", function() {
            User.create({id: "joe", age: 31})
              .after_events(function(record) {
                expect(predicate.evaluate(record)).to(be_true);
                expect(insert_callback).to(have_been_called, with_args(record));
              });
          });
        });

        context("when that record does not match #predicate", function() {
          it("does not trigger #on_remote_insert callbacks", function() {
            User.create({id: "mike", age: 22})
              .after_events(function(record) {
                expect(predicate.evaluate(record)).to(be_false);
                expect(insert_callback).to_not(have_been_called);
              });
          });
        });
      });

      context("when a record is removed from the Selection's #operand remotely", function() {
        context("when that record matches #predicate", function() {
          it("triggers #on_remote_remove callbacks with the removed record", function() {
            var record = operand.find("jan");
            expect(predicate.evaluate(record)).to(be_true);

            operand.remove(record)

            expect(remove_callback).to(have_been_called, with_args(record));
          });
        });

        context("when that record does not match #predicate", function() {
          var record;
          before(function() {
            record = operand.find("mike");
            expect(predicate.evaluate(record)).to(be_false);
          });

          it("does not trigger #on_remote_remove callbacks and continues to not #contain the removed record", function() {
            expect(selection.contains(record)).to(be_false);
            operand.remove(record);
            expect(selection.contains(record)).to(be_false);
            expect(remove_callback).to_not(have_been_called);
          });
        });
      });

      context("when a record in the selection's #operand is updated remotely", function() {
        context("when that record matched #predicate before the update", function() {
          var record;
          before(function() {
            record = operand.find("jan");
            expect(predicate.evaluate(record)).to(be_true);
          });

          context("when that record matches #predicate after the update", function() {
            it("does not trigger #on_remote_insert callbacks", function() {
              record.full_name("Janford Nelsan");
              expect(predicate.evaluate(record)).to(be_true);
              expect(insert_callback).to_not(have_been_called);
            });

            it("does not trigger #on_remote_remove callbacks", function() {
              record.full_name("Janford Nelsan");
              expect(predicate.evaluate(record)).to(be_true);
              expect(remove_callback).to_not(have_been_called);
            });

            it("triggers #on_remote_update callbacks with the updated record and a change object and continues to #contain the record", function() {
              var old_value = record.full_name();
              var new_value = "Janand Nelson";

              expect(selection.contains(record)).to(be_true);
              record.full_name(new_value);
              record.save();
              expect(selection.contains(record)).to(be_true);
              
              expect(predicate.evaluate(record)).to(be_true);

              expect(update_callback).to(have_been_called, once);

              var updated_record = update_callback.most_recent_args[0];
              var updated_attributes = update_callback.most_recent_args[1];
              expect(updated_record).to(equal, record);
              expect(updated_attributes.full_name.column).to(equal, User.full_name);
              expect(updated_attributes.full_name.old_value).to(equal, old_value);
              expect(updated_attributes.full_name.new_value).to(equal, new_value);
            });
          });

          context("when that record does not match #predicate after the update", function() {
            it("does not trigger #on_remote_insert callbacks", function() {
              record.update({age: 34});
              expect(predicate.evaluate(record)).to(be_false);
              expect(insert_callback).to_not(have_been_called);
            });

            it("triggers #on_remote_remove callbacks to be invoked with the updated record", function() {
              record.update({age: 34});
              expect(predicate.evaluate(record)).to(be_false);
              expect(remove_callback).to(have_been_called, with_args(record));
            });

            it("does not trigger #on_remote_update callbacks", function() {
              record.update({age: 34});
              expect(predicate.evaluate(record)).to(be_false);
              expect(update_callback).to_not(have_been_called);
            });

            it("does not #contain the updated record before the #on_remote_remove callbacks are triggered", function() {
              var on_remote_remove_callback = mock_function('on_remote_remove_callback', function() {
                expect(selection.contains(record)).to(be_false);
              });
              selection.on_remote_remove(on_remote_remove_callback);

              expect(selection.contains(record)).to(be_true);
              record.update({age: 34});
              expect(on_remote_remove_callback).to(have_been_called);
            });
          });
        });

        context("when that record did not match #predicate before the update", function() {
          before(function() {
            record = operand.find("mike");
            expect(predicate.evaluate(record)).to(be_false);
          });

          context("when that record matches #predicate after the update", function() {
            it("triggers #on_remote_insert callbacks with the updated record", function() {
              record.update({age: 31});
              expect(predicate.evaluate(record)).to(be_true);
              expect(insert_callback).to(have_been_called);
            });

            it("does not trigger #on_remote_remove callbacks", function() {
              record.update({age: 31});
              expect(predicate.evaluate(record)).to(be_true);
              expect(remove_callback).to_not(have_been_called);
            });

            it("does not trigger #on_remote_update callbacks", function() {
              record.update({age: 31});
              expect(predicate.evaluate(record)).to(be_true);
              expect(update_callback).to_not(have_been_called);
            });

            it("#contains the record before #on_remote_insert callbacks are fired", function() {
              var on_remote_insert_callback = mock_function('on_remote_insert_callback', function(record) {
                expect(selection.contains(record)).to(be_true);
              });
              selection.on_remote_insert(on_remote_insert_callback);

              expect(selection.contains(record)).to(be_false);
              record.update({age: 31});
              expect(on_remote_insert_callback).to(have_been_called);
            });
          });

          context("when that record does not match #predicate after the update", function() {
            it("does not cause #on_remote_insert callbacks to be invoked with the updated record", function() {
              record.full_name("JarJar Nelson");
              expect(predicate.evaluate(record)).to(be_false);
              expect(insert_callback).to_not(have_been_called);
            });

            it("does not cause #on_remote_remove callbacks to be invoked with the updated record", function() {
              record.full_name("JarJar Nelson");
              expect(predicate.evaluate(record)).to(be_false);
              expect(remove_callback).to_not(have_been_called);
            });
            
            it("does not trigger #on_remote_update callbacks", function() {
              record.full_name("JarJar Nelson");
              expect(predicate.evaluate(record)).to(be_false);
              expect(update_callback).to_not(have_been_called);
            });

            it("continues to not #contain the record", function() {
              expect(selection.contains(record)).to(be_false);
              record.full_name("JarJar Nelson");
              expect(selection.contains(record)).to(be_false);
            });
          });
        });
      });
      
      context("when a record is made dirty or clean in the selection's operand", function() {
        var dirty_callback, clean_callback;
        before(function() {
          dirty_callback = mock_function('dirty_callback');
          clean_callback = mock_function('clean_callback');
          selection.on_dirty(dirty_callback);
          selection.on_dirty(clean_callback);
        });

        context("when the record matches the selection's predicate", function() {
          it("triggers on_dirty / on_clean callbacks on the selection", function() {
            var record = selection.first();
            var age_before = record.age();
            record.age(555);
            expect(dirty_callback).to(have_been_called, with_args(record));
            record.age(age_before);
            expect(clean_callback).to(have_been_called, with_args(record));
          });
        });

        context("when the record does not match the selection's predicate", function() {
          it("does not trigger on_dirty / on_clean callbacks on the selection", function() {
            var record = User.find('mike');
            expect(selection.contains(record)).to(be_false);
            var full_name_before = record.full_name();
            record.full_name("Igor Smith");
            expect(dirty_callback).to_not(have_been_called);
            record.full_name(full_name_before);
            expect(clean_callback).to_not(have_been_called);
          });
        });
      });
    });

    describe("subscription propagation", function() {
      describe("when a subscription is registered for the selection, destroyed, and another subscription is registered", function() {
        var event_type;

        scenario("for on_remote_insert callbacks", function() {
          init(function() {
            event_type = "on_remote_insert";
          });
        });

        scenario("for on_remote_update callbacks", function() {
          init(function() {
            event_type = "on_remote_update";
          });
        });

        scenario("for on_remote_remove callbacks", function() {
          init(function() {
            event_type = "on_remote_remove";
          });
        });

        scenario("for on_clean callbacks", function() {
          init(function() {
            event_type = "on_clean";
          });
        });

        scenario("for on_dirty callbacks", function() {
          init(function() {
            event_type = "on_dirty";
          });
        });

        it("subscribes to its #operand and memoizes tuples, then unsubscribes and clears the memoization, then resubscribes and rememoizes", function() {
          expect(operand.has_subscribers()).to(be_false);
          expect(selection._tuples).to(be_null);

          var subscription = selection[event_type].call(selection, function() {});

          expect(operand.has_subscribers()).to(be_true);
          expect(selection._tuples).to_not(be_null);

          subscription.destroy();

          expect(operand.has_subscribers()).to(be_false);
          expect(selection._tuples).to(be_null);

          selection.on_remote_update(function() {});

          expect(operand.has_subscribers()).to(be_true);
          expect(selection._tuples).to_not(be_null);
        });
      });
    });

    describe("#evaluate_in_repository(repository)", function() {
      it("returns the same selection with its operand evaluated in the repository", function() {
        var other_repo = Repository.clone_schema();
        var selection_in_other_repo = selection.evaluate_in_repository(other_repo);

        expect(selection_in_other_repo.operand).to(equal, selection.operand.evaluate_in_repository(other_repo));
        expect(selection_in_other_repo.predicate).to(equal, selection.predicate);

        var table_in_other_repo = User.table.evaluate_in_repository(other_repo);
        expect(table_in_other_repo).to(equal, other_repo.tables.users);
      });
    });
  });
}});
