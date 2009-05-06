require("/specs/june_spec_helper");

Screw.Unit(function(c) { with(c) {
  describe("Relations.InnerJoin", function() {
    var join, left_operand, right_operand, predicate, tuple;

    before(function() {
      left_operand = User;
      right_operand = Pet;
      predicate = new June.Predicates.EqualTo(User.id, Pet.owner_id);
      join = new June.Relations.InnerJoin(left_operand, right_operand, predicate);
    });

    describe("#tuples", function() {
      it("includes all CompoundTuples in the cartesean product of the #tuples of the operands that match #predicate", function() {
        var tuples = join.tuples();
        expect(tuples).to_not(be_empty);
        jQuery.each(tuples, function() {
          expect(predicate.evaluate(this)).to(equal, true);
        });
      });
    });

    describe("#wire_representation", function() {
      it("returns the JSON representation of the InnerJoin", function() {
        expect(join.wire_representation()).to(equal, {
          type: "inner_join",
          left_operand: {
            type: "set",
            name: "users"
          },
          right_operand: {
            type: "set",
            name: "pets"
          },
          predicate: {
            type: "eq",
            left_operand: {
              type: "attribute",
              set: "users",
              name: "id"
            },
            right_operand: {
              type: "attribute",
              set: "pets",
              name: "owner_id"
            }
          }
        });
      });
    });

    // TODO: test contains
    // TODO: test has_subscribers
    // TODO: test subscription propagation

    describe("event handling", function() {
      var insert_handler, remove_handler, update_handler;
      before(function() {
        insert_handler = mock_function("insert handler");
        join.on_insert(insert_handler);

        remove_handler = mock_function("remove handler");
        join.on_remove(remove_handler);

        update_handler = mock_function("update handler");
        join.on_update(update_handler);
      });

      describe("insertion events on operands", function() {
        context("when a tuple is inserted into the left operand", function() {
          context("when the insertion causes #cartesean_product to contain a new CompositeTuple that matches the predicate", function() {
            it("triggers #on_insert handlers with the new CompositeTuple", function() {
              var right_tuple = Pet.create({owner_id: "amy"});
              var left_tuple = User.create({id: "amy"});

              expect(insert_handler).to(have_been_called, once);
              var composite_tuple = insert_handler.most_recent_args[0];
              expect(composite_tuple.left).to(equal, left_tuple);
              expect(composite_tuple.right).to(equal, right_tuple);
            });

            it("#contains the new CompositeTuple before #on_insert handlers are triggered", function() {
              join.on_insert(function(composite_tuple) {
                expect(join.contains(composite_tuple)).to(be_true);
              });

              Pet.create({owner_id: "amy"});
              User.create({id: "amy"});
            });
          });

          context("when the insertion does NOT cause #cartesean_product to contain a new CompositeTuple that matches the predicate", function() {
            it("does not trigger #on_insert handlers", function() {
              User.create({id: "amy"});
              expect(insert_handler).to_not(have_been_called);
            });

            it("does not modify the contents of #tuples", function() {
              var num_tuples_before_insertion = join.tuples().length;
              User.create({id: "amy"});
              expect(join.tuples().length).to(equal, num_tuples_before_insertion);
            });
          });
        });

        context("when a tuple is inserted into the right operand", function() {
          context("when the insertion causes #cartesean_product to contain a new CompositeTuple that matches the predicate", function() {
            it("triggers #on_insert handlers with the new CompositeTuple", function() {
              var left_tuple = User.create({id: "amy"});
              var right_tuple = Pet.create({owner_id: "amy"});

              expect(insert_handler).to(have_been_called, once);
              var composite_tuple = insert_handler.most_recent_args[0];
              expect(composite_tuple.left).to(equal, left_tuple);
              expect(composite_tuple.right).to(equal, right_tuple);
            });

            it("#contains the new CompositeTuple before #on_insert handlers are triggered", function() {
              join.on_insert(function(composite_tuple) {
                expect(join.contains(composite_tuple)).to(be_true);
              });

              User.create({id: "amy"});
              Pet.create({owner_id: "amy"});
            });
          });

          context("when the insertion does NOT cause #cartesean_product to contain a new CompositeTuple that matches the predicate", function() {
            it("does not trigger #on_insert handlers", function() {
              Pet.create({owner_id: "amy"});
              expect(insert_handler).to_not(have_been_called);
            });

            it("does not modify the contents of #tuples", function() {
              var num_tuples_before_insertion = join.tuples().length;
              Pet.create({owner_id: "amy"});
              expect(join.tuples().length).to(equal, num_tuples_before_insertion);
            });
          });
        });
      });

      describe("removal events on operands", function() {
        context("when a tuple is removed from the left operand", function() {
          context("when the removal causes the removal of a CompositeTuple from #cartesean_product that matched #predicate", function() {
            it("triggers #on_remove handlers with the removed CompositeTuple", function() {
              tuple = User.remove(User.find("bob"));
              expect(remove_handler).to(have_been_called, once);
              var removed_composite_tuple = remove_handler.most_recent_args[0];
              expect(removed_composite_tuple.left).to(equal, tuple);
              expect(removed_composite_tuple.right).to(equal, Pet.find("blue"));
            });

            it("no longer #contains the removed CompositeTuple before #on_remove handlers are triggered", function() {
              join.on_remove(function(composite_tuple) {
                expect(join.contains(composite_tuple)).to(be_false);
              });
              User.remove(User.find("bob"));
            });
          });

          context("when the removal does not cause the removal of any CompositeTuples from #cartesean_product that match #predicate", function() {
            it("does not trigger #on_remove handlers", function() {
              User.remove(User.find("jean"));
              expect(remove_handler).to_not(have_been_called);
            });

            it("does not modify the contents of #tuples", function() {
              var num_tuples_before_removal = join.tuples().length;
              User.remove(User.find("jean"));
              expect(join.tuples().length).to(equal, num_tuples_before_removal);
            });
          });
        });

        context("when a tuple is removed from the right operand", function() {
          context("when the removal causes the removal of a CompositeTuple from #cartesean_product that matched #predicate", function() {
            it("triggers #on_remove handlers with the removed CompositeTuple", function() {
              tuple = Pet.remove(Pet.find("blue"));
              expect(remove_handler).to(have_been_called, once);
              var removed_composite_tuple = remove_handler.most_recent_args[0];
              expect(removed_composite_tuple.left).to(equal, User.find("bob"));
              expect(removed_composite_tuple.right).to(equal, tuple);
            });

            it("no longer #contains the removed CompositeTuple before #on_remove handlers are triggered", function() {
              join.on_remove(function(composite_tuple) {
                expect(join.contains(composite_tuple)).to(be_false);
              });
              Pet.remove(Pet.find("blue"));
            });
          });

          context("when the removal does not cause the removal of any CompositeTuples from #cartesean_product that match #predicate", function() {
            it("does not trigger #on_remove handlers", function() {
              User.remove(Pet.find("stray"));
              expect(remove_handler).to_not(have_been_called);
            });

            it("does not modify the contents of #tuples", function() {
              var num_tuples_before_removal = join.tuples().length;
              Pet.remove(Pet.find("stray"));
              expect(join.tuples().length).to(equal, num_tuples_before_removal);
            });
          });
        });
      });

      describe("update events on operands", function() {
        context("when a tuple is updated in the left operand", function() {
          context("when the updated tuple is the #left component of a CompositeTuple that is a member of #tuples before the update", function() {
            before(function() {
              tuple = User.find("bob");
            });


            context("when the CompositeTuple continues to match #predicate after the update", function() {
              it("does not trigger #on_insert handlers", function() {
                tuple.age(44);
                expect(insert_handler).to_not(have_been_called);
              });

              it("does not trigger #on_remove handlers", function() {
                tuple.age(44);
                expect(remove_handler).to_not(have_been_called);
              });

              it("triggers #on_update handlers with the updated CompositeTuple and a changed attributes object", function() {
                var old_value = tuple.age();
                var new_value = 44;
                tuple.age(new_value);
                expect(update_handler).to(have_been_called, once);
                var updated_tuple = update_handler.most_recent_args[0];
                var changed_attributes = update_handler.most_recent_args[1];

                expect(updated_tuple.left).to(equal, tuple);

                expect(changed_attributes.age.attribute).to(equal, tuple.set.age);
                expect(changed_attributes.age.old_value).to(equal, old_value);
                expect(changed_attributes.age.new_value).to(equal, new_value);
              });

              it("does not modify the contents of #tuples", function() {
                var num_tuples_before_removal = join.tuples().length;
                tuple.age(44);
                expect(join.tuples().length).to(equal, num_tuples_before_removal);
              });
            });
            
            context("when the CompositeTuple no longer matches #predicate after the update", function() {
              it("does not trigger #on_insert handlers", function() {
                tuple.id("booboo");
                expect(insert_handler).to_not(have_been_called);
              });

              it("triggers #on_remove handlers with the updated CompositeTuple", function() {
                tuple.id("booboo");
                expect(remove_handler).to(have_been_called, once);
                expect(remove_handler.most_recent_args[0].left).to(equal, tuple);
              });

              it("does not trigger #on_update handlers", function() {
                tuple.id("booboo");
                expect(update_handler).to_not(have_been_called);
              });

              it("removes the updated CompositeTuple from #tuples before triggering #on_remove handlers", function() {
                join.on_remove(function(composite_tuple) {
                  expect(join.contains(composite_tuple)).to(be_false);
                });
                tuple.id("booboo");
              });
            });
          });
          
          context("when the updated tuple is not a component of a CompositeTuple that is a member of #tuples before the update", function() {
            context("when the update causes #cartesean_product to contain a CompositeTuple that matches #predicate", function() {
              var right_tuple, left_tuple;

              before(function() {
                right_tuple = Pet.create({owner_id: "amanda"});
                left_tuple = User.find("alice");
              });

              it("triggers #on_insert handlers with the updated CompositeTuple", function() {
                left_tuple.id("amanda");
                expect(insert_handler).to(have_been_called, once);

                var composite_tuple = insert_handler.most_recent_args[0];
                expect(composite_tuple.left).to(equal, left_tuple);
                expect(composite_tuple.right).to(equal, right_tuple);
              });

              it("does not trigger #on_remove handlers", function() {
                left_tuple.id("amanda");
                expect(remove_handler).to_not(have_been_called);
              });

              it("does not trigger #on_update handlers", function() {
                left_tuple.id("amanda");
                expect(update_handler).to_not(have_been_called);
              });

              it("adds the updated CompositeTuple to #tuples before triggering #on_insert handlers", function() {
                join.on_insert(function(composite_tuple) {
                  expect(join.contains(composite_tuple)).to(be_true);
                });
                left_tuple.id("amanda");
              });
            });

            context("when the update does not cause #cartesean_product to contain a CompositeTuple that matches #predicate", function() {
              var left_tuple;
              before(function() {
                left_tuple = User.find("alice");
              });

              it("does not trigger #on_insert handlers", function() {
                left_tuple.age(42);
                expect(insert_handler).to_not(have_been_called);
              });

              it("does not trigger #on_remove handlers", function() {
                left_tuple.age(42);
                expect(remove_handler).to_not(have_been_called);
              });

              it("does not trigger #on_update handlers", function() {
                left_tuple.age(42);
                expect(update_handler).to_not(have_been_called);
              });
            });
          });
        });

        context("when a tuple is updated in the right operand", function() {
          context("when the updated tuple is the #right component of a CompositeTuple that is a member of #tuples before the update", function() {
            before(function() {
              tuple = Pet.find("blue");
            });

            context("when the CompositeTuple continues to match #predicate after the update", function() {
              it("does not trigger #on_insert handlers", function() {
                tuple.name("booboo");
                expect(insert_handler).to_not(have_been_called);
              });

              it("does not trigger #on_remove handlers", function() {
                tuple.name("booboo");
                expect(remove_handler).to_not(have_been_called);
              });

              it("triggers #on_update handlers with the updated CompositeTuple", function() {
                var old_value = tuple.name();
                var new_value = "booboo"
                tuple.name(new_value);

                expect(update_handler).to(have_been_called, once);

                var updated_tuple = update_handler.most_recent_args[0];
                var changed_attributes = update_handler.most_recent_args[1];

                expect(updated_tuple.right).to(equal, tuple);
                expect(changed_attributes.name.attribute).to(equal, tuple.set.name);
                expect(changed_attributes.name.old_value).to(equal, old_value);
                expect(changed_attributes.name.new_value).to(equal, new_value);
              });

              it("does not modify the contents of #tuples", function() {
                var num_tuples_before_removal = join.tuples().length;
                tuple.name("booboo");
                expect(join.tuples().length).to(equal, num_tuples_before_removal);
              });
            });

            context("when the CompositeTuple no longer matches #predicate after the update", function() {
              it("does not trigger #on_insert handlers", function() {
                tuple.owner_id(null);
                expect(insert_handler).to_not(have_been_called);
              });

              it("triggers #on_remove handlers with the updated CompositeTuple", function() {
                tuple.owner_id(null);
                
                expect(remove_handler).to(have_been_called, once);
                expect(remove_handler.most_recent_args[0].right).to(equal, tuple);
              });

              it("does not trigger #on_update handlers", function() {
                tuple.owner_id(null);
                expect(update_handler).to_not(have_been_called);
              });

              it("removes the updated CompositeTuple from #tuples before triggering #on_remove handlers", function() {
                join.on_remove(function(composite_tuple) {
                  expect(join.contains(composite_tuple)).to(be_false);
                });
                tuple.owner_id(null);
              });
            });
          });

          context("when the updated tuple is not a component of a CompositeTuple that is a member of #tuples before the update", function() {
            context("when the update causes #cartesean_product to contain a CompositeTuple that matches #predicate", function() {
              var right_tuple, left_tuple;

              before(function() {
                right_tuple = Pet.find("stray");
                left_tuple = User.find("alice");
              });

              it("triggers #on_insert handlers with the new CompositeTuple", function() {
                right_tuple.owner_id(left_tuple.id());

                expect(insert_handler).to(have_been_called, once);

                var composite_tuple = insert_handler.most_recent_args[0];
                expect(composite_tuple.left).to(equal, left_tuple);
                expect(composite_tuple.right).to(equal, right_tuple);
              });

              it("does not trigger #on_remove handlers", function() {
                right_tuple.owner_id(left_tuple.id());
                expect(remove_handler).to_not(have_been_called);
              });

              it("does not trigger #on_update handlers", function() {
                right_tuple.owner_id(left_tuple.id());
                expect(update_handler).to_not(have_been_called);
              });

              it("adds the updated CompositeTuple to #tuples before triggering #on_insert handlers", function() {
                join.on_insert(function(composite_tuple) {
                  expect(join.contains(composite_tuple)).to(be_true);
                });
                right_tuple.owner_id(left_tuple.id());
              });
            });

            context("when the update does not cause #cartesean_product to contain a CompositeTuple that matches #predicate", function() {
              var right_tuple;
              before(function() {
                right_tuple = Pet.find("stray");
              });

              it("does not trigger #on_insert handlers", function() {
                right_tuple.name("fido");
                expect(insert_handler).to_not(have_been_called);
              });

              it("does not trigger #on_remove handlers", function() {
                right_tuple.name("fido");
                expect(remove_handler).to_not(have_been_called);
              });

              it("does not trigger #on_update handlers", function() {
                right_tuple.name("fido");
                expect(update_handler).to_not(have_been_called);
              });
            });
          });
        });

        context("when a tuple is updated in a way that should insert one CompositeTuple and remove another", function() {
          var pet, current_owner, new_owner;

          before(function() {
            pet = Pet.find("blue");
            current_owner = pet.owner();
            new_owner = User.find("alice");
          });

          it("fires #on_insert handlers for the inserted tuple", function() {
            pet.owner_id(new_owner.id());

            expect(insert_handler).to(have_been_called, once);

            var composite_tuple = insert_handler.most_recent_args[0];
            expect(composite_tuple.left).to(equal, new_owner);
            expect(composite_tuple.right).to(equal, pet);
          });

          it("fires #on_remove handlers for the removed tuple", function() {
            pet.owner_id(new_owner.id());

            expect(remove_handler).to(have_been_called, once);

            var composite_tuple = remove_handler.most_recent_args[0];
            expect(composite_tuple.left).to(equal, current_owner);
            expect(composite_tuple.right).to(equal, pet);
          });

          it("updates #tuples appropriately", function() {
            var old_composite_tuple = new June.CompositeTuple(current_owner, pet);
            var new_composite_tuple = new June.CompositeTuple(new_owner, pet);

            expect(join.find_composite_tuple_that_matches(old_composite_tuple)).to_not(be_null);
            expect(join.find_composite_tuple_that_matches(new_composite_tuple)).to(be_null);

            pet.owner_id(new_owner.id());
            
            expect(join.find_composite_tuple_that_matches(old_composite_tuple)).to(be_null);
            expect(join.find_composite_tuple_that_matches(new_composite_tuple)).to_not(be_null);
          });
        });
      });
    });


    describe("subscription propagation", function() {
      describe("when a Subscription is registered for the Join, destroyed, and another Subscription is registered", function() {
        it("subscribes to its #left_operand and #right_operand and memoizes #tuples, then unsubscribes and clears the memoization, then resubscribes and rememoizes", function() {
          expect(left_operand.has_subscribers()).to(be_false);
          expect(right_operand.has_subscribers()).to(be_false);
          expect(join._tuples).to(be_null);

          var subscription = join.on_insert(function() {});

          expect(left_operand.has_subscribers()).to(be_true);
          expect(right_operand.has_subscribers()).to(be_true);
          expect(join._tuples).to_not(be_null);

          subscription.destroy();

          expect(left_operand.has_subscribers()).to(be_false);
          expect(right_operand.has_subscribers()).to(be_false);
          expect(join._tuples).to(be_null);

          join.on_update(function() {});

          expect(left_operand.has_subscribers()).to(be_true);
          expect(right_operand.has_subscribers()).to(be_true);
          expect(join._tuples).to_not(be_null);
        });
      });

      describe("#on_insert subscriptions", function() {
        describe("when an #on_insert subscription is registered", function() {
          context("when this is the first subscription", function() {
            before(function() {
              expect(join.has_subscribers()).to(be_false);
            });

            it("subscribes #on_insert, #on_remove, and #on_update on #left_operand and #right_operand", function() {
              mock(left_operand, 'on_insert');
              mock(left_operand, 'on_remove');
              mock(left_operand, 'on_update');
              mock(right_operand, 'on_insert');
              mock(right_operand, 'on_remove');
              mock(right_operand, 'on_update');

              join.on_insert(function() {});

              expect(left_operand.on_insert).to(have_been_called);
              expect(left_operand.on_remove).to(have_been_called);
              expect(left_operand.on_update).to(have_been_called);
              expect(right_operand.on_insert).to(have_been_called);
              expect(right_operand.on_remove).to(have_been_called);
              expect(right_operand.on_update).to(have_been_called);
            });
          });

          context("when this is not the first subscription", function() {
            before(function() {
              join.on_insert(function() {});
            });

            it("does not subscribe to #left_operand and #right_operand", function() {
              mock(left_operand, 'on_insert');
              mock(left_operand, 'on_remove');
              mock(left_operand, 'on_update');
              mock(right_operand, 'on_insert');
              mock(right_operand, 'on_remove');
              mock(right_operand, 'on_update');

              join.on_insert(function() {});

              expect(left_operand.on_insert).to_not(have_been_called);
              expect(left_operand.on_remove).to_not(have_been_called);
              expect(left_operand.on_update).to_not(have_been_called);
              expect(right_operand.on_insert).to_not(have_been_called);
              expect(right_operand.on_remove).to_not(have_been_called);
              expect(right_operand.on_update).to_not(have_been_called);
            });
          });
        });

        describe("when an #on_insert subscription is destroyed", function() {
          var subscription;
          before(function() {
            subscription = join.on_insert(function() {});
          });

          context("when it is the last subscription to be destroyed", function() {
            it("destroys the #on_insert, #on_remove, and #on_update subscriptions on #left_operand and #right_operand", function() {
              expect(join.operand_subscriptions.length).to(equal, 6);

              var subscriptions = [];
              jQuery.each(join.operand_subscriptions, function() {
                subscriptions.push(this);
                mock(this, 'destroy');
              });

              subscription.destroy();

              jQuery.each(subscriptions, function() {
                expect(this.destroy).to(have_been_called);
              });
              expect(join.operand_subscriptions).to(be_empty);
            });

          });

          context("when it is not the last subscription to be destroyed", function() {
            var subscription1, subscription2;
            before(function() {
              subscription1 = join.on_insert(function() {});
              subscription2 = join.on_insert(function() {});
            });

            it("does not destroy the #on_insert and #on_update subscriptions on #operand", function() {
              expect(join.operand_subscriptions.length).to(equal, 6);

              jQuery.each(join.operand_subscriptions, function() {
                mock(this, 'destroy');
              });

              subscription1.destroy();

              jQuery.each(join.operand_subscriptions, function() {
                expect(this.destroy).to_not(have_been_called);
              });

              expect(join.operand_subscriptions.length).to(equal, 6);
            });
          });
        });
      });

      describe("#on_remove subscriptions", function() {
        describe("when an #on_remove subscription is registered", function() {
          context("when this is the first subscription", function() {
            before(function() {
              expect(join.has_subscribers()).to(be_false);
            });

            it("subscribes #on_insert, #on_remove, and #on_update on #left_operand and #right_operand", function() {
              mock(left_operand, 'on_insert');
              mock(left_operand, 'on_remove');
              mock(left_operand, 'on_update');
              mock(right_operand, 'on_insert');
              mock(right_operand, 'on_remove');
              mock(right_operand, 'on_update');

              join.on_remove(function() {});

              expect(left_operand.on_insert).to(have_been_called);
              expect(left_operand.on_remove).to(have_been_called);
              expect(left_operand.on_update).to(have_been_called);
              expect(right_operand.on_insert).to(have_been_called);
              expect(right_operand.on_remove).to(have_been_called);
              expect(right_operand.on_update).to(have_been_called);
            });
          });

          context("when this is not the first subscription", function() {
            before(function() {
              join.on_remove(function() {});
            });

            it("does not subscribe to #left_operand and #right_operand", function() {
              mock(left_operand, 'on_insert');
              mock(left_operand, 'on_remove');
              mock(left_operand, 'on_update');
              mock(right_operand, 'on_insert');
              mock(right_operand, 'on_remove');
              mock(right_operand, 'on_update');

              join.on_remove(function() {});

              expect(left_operand.on_insert).to_not(have_been_called);
              expect(left_operand.on_remove).to_not(have_been_called);
              expect(left_operand.on_update).to_not(have_been_called);
              expect(right_operand.on_insert).to_not(have_been_called);
              expect(right_operand.on_remove).to_not(have_been_called);
              expect(right_operand.on_update).to_not(have_been_called);
            });
          });
        });

        describe("when an #on_remove subscription is destroyed", function() {
          var subscription;
          before(function() {
            subscription = join.on_remove(function() {});
          });

          context("when it is the last subscription to be destroyed", function() {
            it("destroys the #on_insert, #on_remove, and #on_update subscriptions on #left_operand and #right_operand", function() {
              expect(join.operand_subscriptions.length).to(equal, 6);

              var subscriptions = [];
              jQuery.each(join.operand_subscriptions, function() {
                subscriptions.push(this);
                mock(this, 'destroy');
              });

              subscription.destroy();

              jQuery.each(subscriptions, function() {
                expect(this.destroy).to(have_been_called);
              });
              expect(join.operand_subscriptions).to(be_empty);
            });

          });

          context("when it is not the last subscription to be destroyed", function() {
            var subscription1, subscription2;
            before(function() {
              subscription1 = join.on_remove(function() {});
              subscription2 = join.on_remove(function() {});
            });

            it("does not destroy the #on_insert and #on_update subscriptions on #operand", function() {
              expect(join.operand_subscriptions.length).to(equal, 6);

              jQuery.each(join.operand_subscriptions, function() {
                mock(this, 'destroy');
              });

              subscription1.destroy();

              jQuery.each(join.operand_subscriptions, function() {
                expect(this.destroy).to_not(have_been_called);
              });

              expect(join.operand_subscriptions.length).to(equal, 6);
            });
          });
        });
      });

      describe("#on_update subscriptions", function() {
        describe("when an #on_update subscription is registered", function() {
          context("when this is the first subscription", function() {
            before(function() {
              expect(join.has_subscribers()).to(be_false);
            });

            it("subscribes #on_insert, #on_remove, and #on_update on #left_operand and #right_operand", function() {
              mock(left_operand, 'on_insert');
              mock(left_operand, 'on_remove');
              mock(left_operand, 'on_update');
              mock(right_operand, 'on_insert');
              mock(right_operand, 'on_remove');
              mock(right_operand, 'on_update');

              join.on_update(function() {});

              expect(left_operand.on_insert).to(have_been_called);
              expect(left_operand.on_remove).to(have_been_called);
              expect(left_operand.on_update).to(have_been_called);
              expect(right_operand.on_insert).to(have_been_called);
              expect(right_operand.on_remove).to(have_been_called);
              expect(right_operand.on_update).to(have_been_called);
            });
          });

          context("when this is not the first subscription", function() {
            before(function() {
              join.on_update(function() {});
            });

            it("does not subscribe to #left_operand and #right_operand", function() {
              mock(left_operand, 'on_insert');
              mock(left_operand, 'on_remove');
              mock(left_operand, 'on_update');
              mock(right_operand, 'on_insert');
              mock(right_operand, 'on_remove');
              mock(right_operand, 'on_update');

              join.on_update(function() {});

              expect(left_operand.on_insert).to_not(have_been_called);
              expect(left_operand.on_remove).to_not(have_been_called);
              expect(left_operand.on_update).to_not(have_been_called);
              expect(right_operand.on_insert).to_not(have_been_called);
              expect(right_operand.on_remove).to_not(have_been_called);
              expect(right_operand.on_update).to_not(have_been_called);
            });
          });
        });

        describe("when an #on_update subscription is destroyed", function() {
          var subscription;
          before(function() {
            subscription = join.on_update(function() {});
          });

          context("when it is the last subscription to be destroyed", function() {
            it("destroys the #on_insert, #on_remove, and #on_update subscriptions on #left_operand and #right_operand", function() {
              expect(join.operand_subscriptions.length).to(equal, 6);

              var subscriptions = [];
              jQuery.each(join.operand_subscriptions, function() {
                subscriptions.push(this);
                mock(this, 'destroy');
              });

              subscription.destroy();

              jQuery.each(subscriptions, function() {
                expect(this.destroy).to(have_been_called);
              });
              expect(join.operand_subscriptions).to(be_empty);
            });

          });

          context("when it is not the last subscription to be destroyed", function() {
            var subscription1, subscription2;
            before(function() {
              subscription1 = join.on_update(function() {});
              subscription2 = join.on_update(function() {});
            });

            it("does not destroy the #on_insert and #on_update subscriptions on #operand", function() {
              expect(join.operand_subscriptions.length).to(equal, 6);

              jQuery.each(join.operand_subscriptions, function() {
                mock(this, 'destroy');
              });

              subscription1.destroy();

              jQuery.each(join.operand_subscriptions, function() {
                expect(this.destroy).to_not(have_been_called);
              });

              expect(join.operand_subscriptions.length).to(equal, 6);
            });
          });
        });
      });
    });


  });
}});