require("/specs/june_spec_helper");

Screw.Unit(function(c) { with(c) {
  describe("Relations.SetProjection", function() {
    var projection, operand, projected_set;

    before(function() {
      operand = User.join(Pet).on(User.id.eq(Pet.owner_id));
      projected_set = Pet;
      projection = new June.Relations.SetProjection(operand, projected_set);
    });

    describe("#all", function() {
      it("extracts the tuples belonging to the #projected_set from the CompoundTuples in by its #operand", function() {
        var t = operand.all()[0];
        var expected_tuples = Pet.where(Pet.owner_id.neq(null)).all();
        var all = projection.all();

        expect(all).to(equal, expected_tuples);
      });
    });

    describe("#wire_representation", function() {
      it("returns the JSON representation of the SetProjection", function() {
        expect(projection.wire_representation()).to(equal, {
          type: "set_projection",
          operand: {
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
          },
          projected_set: "pets"
        });
      });

    });

    describe("#on_insert", function() {
      it("returns a Subscription with #on_insert_node as its #node", function() {
        var subscription = projection.on_insert(function() {});
        expect(subscription.node).to(equal, projection.on_insert_node);
      });
    });

    describe("#on_remove", function() {
      it("returns a Subscription with #on_remove_node as its #node", function() {
        var subscription = projection.on_remove(function() {});
        expect(subscription.node).to(equal, projection.on_remove_node);
      });
    });

    describe("#on_update", function() {
      it("returns a Subscription with #on_update_node as its #node", function() {
        var subscription = projection.on_update(function() {});
        expect(subscription.node).to(equal, projection.on_update_node);
      });
    });

    describe("#has_subscribers", function() {
      context("if a handler has been registered with #on_insert", function() {
        it("returns true", function() {
          projection.on_insert(function() {});
          expect(projection.has_subscribers()).to(be_true);
        });
      });

      context("if a handler has been registered with #on_remove", function() {
        it("returns true", function() {
          projection.on_remove(function() {});
          expect(projection.has_subscribers()).to(be_true);
        });
      });

      context("if a handler has been registered with #on_update", function() {
        it("returns true", function() {
          projection.on_update(function() {});
          expect(projection.has_subscribers()).to(be_true);
        });
      });

      context("if no handlers have been registered", function() {
        it("returns false", function() {
          expect(projection.has_subscribers()).to(be_false);
        });
      });
    });
    
    describe("event handling", function() {
      var insert_handler, remove_handler, update_handler, tuple;
      before(function() {
        projected_set = User;
        projection = new June.Relations.SetProjection(operand, projected_set);

        insert_handler = mock_function("insert handler");
        projection.on_insert(insert_handler);

        remove_handler = mock_function("remove handler");
        projection.on_remove(remove_handler);

        update_handler = mock_function("update handler");
        projection.on_update(update_handler);
      });

      context("when a CompositeTuple is inserted in the Projection's #operand", function() {
        context("when the projected tuple is already a member of #all", function() {
          it("does not trigger #on_insert handlers", function() {
            Pet.local_create({owner_id: "bob"});
            expect(insert_handler).to_not(have_been_called);
          });

          it("does not modify #all", function() {
            var num_tuples_before_insert = projection.all().length;
            Pet.local_create({owner_id: "bob"});
            expect(projection.all().length).to(equal, num_tuples_before_insert);
          });
        });

        context("when the tuple corresponding to #projected_set is NOT a member of the Projection's #all", function() {
          var petless_user;

          before(function() {
            petless_user = User.find("alice");
            expect(petless_user.pets.all()).to(be_empty);
          });

          it("triggers #on_insert handlers with the projected tuple", function() {
            Pet.local_create({owner_id: petless_user.id()});
            expect(insert_handler).to(have_been_called, once);
            expect(insert_handler).to(have_been_called, with_args(petless_user));
          });

          it("adds the projected to #all before #on_insert handlers are triggered", function() {
            projection.on_insert(function(tuple) {
              expect(projection.contains(tuple)).to(be_true);
            });
            Pet.local_create({owner_id: petless_user.id()});
          });
        });
      });

      context("when a CompositeTuple is removed from the Projection's #operand", function() {
        context("when #operand contains another CompositeTuple with the same projected tuple", function() {
          var pet;
          before(function() {
            var user = User.find("bob");
            pet = Pet.local_create({owner_id: "bob"});
            expect(user.pets.all().length).to(be_gt, 1);
          });

          it("does not trigger #on_remove handlers", function() {
            Pet.remove(pet);
            expect(remove_handler).to_not(have_been_called);
          });

          it("does not modify #all", function() {
            var num_tuples_before_remove = projection.all().length;
            Pet.remove(pet);
            expect(projection.all().length).to(equal, num_tuples_before_remove);
          });
        });

        context("when #operand contains no other CompositeTuples with the same projected tuple", function() {
          var user, pet;
          before(function() {
            user = User.find("bob")
            expect(user.pets.all().length).to(equal, 1);
            pet = Pet.find("blue");
            expect(pet.owner_id()).to(equal, "bob");
          });

          it("triggers #on_remove handlers with the projected tuple", function() {
            Pet.remove(pet);

            expect(remove_handler).to(have_been_called, once);
            expect(remove_handler).to(have_been_called, with_args(user));
          });

          it("removes the projected tuple from #all before #on_remove handlers are triggered", function() {
            projection.on_remove(function(tuple) {
              expect(projection.contains(tuple)).to(be_false);
            });
            Pet.remove(pet);            
          });
        });
      });

      context("when a tuple in the Projection's #operand is updated", function() {
        var tuple;

        context("when the tuple that was updated corresponds to #projected_set", function() {
          before(function() {
            tuple = User.find("bob");
            expect(tuple.set == projected_set).to(be_true);
          });

          it("triggers #on_update handlers with the projected tuple", function() {
            tuple.first_name("robérto");
            expect(update_handler).to(have_been_called, once);
            expect(update_handler).to(have_been_called, with_args(tuple, null));
          });

          it("does not modify #all", function() {
            var num_tuples_before_update = projection.all().length;
            tuple.first_name("boba tea");
            expect(projection.all().length).to(equal, num_tuples_before_update);
          });
        });

        context("when the tuple that was updated does NOT correspond to #projected_set", function() {
          before(function() {
            tuple = Pet.find("blue");
            expect(tuple.set == projected_set).to(be_false);
          });

          it("does NOT trigger #on_update handlers with the projected tuple", function() {
            tuple.name("worthless");
            expect(update_handler).to_not(have_been_called);
          });

          it("does not modify #all", function() {
            var num_tuples_before_update = projection.all().length;
            tuple.name("worthless");
            expect(projection.all().length).to(equal, num_tuples_before_update);
          });
        });
      });
    });

    describe("subscription propagation", function() {
      describe("when a Subscription is registered for the SetProjection, destroyed, and another Subscription is registered", function() {
        it("subscribes to its #operand and memoizes #all, then unsubscribes and clears the memoization, then resubscribes and rememoizes", function() {
          expect(operand.has_subscribers()).to(be_false);
          expect(projection._tuples).to(be_null);

          var subscription = projection.on_insert(function() {});

          expect(operand.has_subscribers()).to(be_true);
          expect(projection._tuples).to_not(be_null);

          subscription.destroy();

          expect(operand.has_subscribers()).to(be_false);
          expect(projection._tuples).to(be_null);

          projection.on_update(function() {});

          expect(operand.has_subscribers()).to(be_true);
          expect(projection._tuples).to_not(be_null);
        });
      });

      describe("#on_insert subscriptions", function() {
        describe("when an #on_insert subscription is registered", function() {
          context("when this is the first subscription", function() {
            before(function() {
              expect(projection.has_subscribers()).to(be_false);
            });

            it("subscribes #on_insert, #on_remove, and #on_update on #operand", function() {
              mock(operand, 'on_insert');
              mock(operand, 'on_remove');
              mock(operand, 'on_update');

              projection.on_insert(function() {});

              expect(operand.on_insert).to(have_been_called);
              expect(operand.on_remove).to(have_been_called);
              expect(operand.on_update).to(have_been_called);
            });
          });

          context("when this is not the first subscription", function() {
            before(function() {
              projection.on_insert(function() {});
            });

            it("does not subscribe to #operand", function() {
              mock(operand, 'on_insert');
              mock(operand, 'on_remove');
              mock(operand, 'on_update');

              projection.on_insert(function() {});

              expect(operand.on_insert).to_not(have_been_called);
              expect(operand.on_remove).to_not(have_been_called);
              expect(operand.on_update).to_not(have_been_called);
            });
          });
        });

        describe("when an #on_insert subscription is destroyed", function() {
          var subscription;
          before(function() {
            subscription = projection.on_insert(function() {});
          });

          context("when it is the last subscription to be destroyed", function() {
            it("destroys the #on_insert, #on_remove, and #on_update subscriptions on #operand", function() {
              mock(projection.operand_subscription_bundle, 'destroy_all')
              subscription.destroy();
              expect(projection.operand_subscription_bundle.destroy_all).to(have_been_called);
            });
          });

          context("when it is not the last subscription to be destroyed", function() {
            before(function() {
              projection.on_insert(function() {});
            });

            it("does not destroy the #on_insert and #on_update subscriptions on #operand", function() {
              mock(projection.operand_subscription_bundle, 'destroy_all')
              subscription.destroy();
              expect(projection.operand_subscription_bundle.destroy_all).to_not(have_been_called);
            });
          });
        });
      });

      describe("#on_remove subscriptions", function() {
        describe("when an #on_remove subscription is registered", function() {
          context("when this is the first subscription", function() {
            before(function() {
              expect(projection.has_subscribers()).to(be_false);
            });

            it("subscribes #on_insert, #on_remove, and #on_update on #operand", function() {
              mock(operand, 'on_insert');
              mock(operand, 'on_remove');
              mock(operand, 'on_update');

              projection.on_remove(function() {});

              expect(operand.on_insert).to(have_been_called);
              expect(operand.on_remove).to(have_been_called);
              expect(operand.on_update).to(have_been_called);
            });
          });

          context("when this is not the first subscription", function() {
            before(function() {
              projection.on_remove(function() {});
            });

            it("does not subscribe to #operand", function() {
              mock(operand, 'on_insert');
              mock(operand, 'on_remove');
              mock(operand, 'on_update');

              projection.on_remove(function() {});

              expect(operand.on_insert).to_not(have_been_called);
              expect(operand.on_remove).to_not(have_been_called);
              expect(operand.on_update).to_not(have_been_called);
            });
          });
        });

        describe("when an #on_remove subscription is destroyed", function() {
          var subscription;
          before(function() {
            subscription = projection.on_remove(function() {});
          });

          context("when it is the last subscription to be destroyed", function() {
            it("destroys the #on_insert and #on_update subscriptions on #operand", function() {
              mock(projection.operand_subscription_bundle, 'destroy_all')
              subscription.destroy();
              expect(projection.operand_subscription_bundle.destroy_all).to(have_been_called);
            });
          });

          context("when it is not the last subscription to be destroyed", function() {
            before(function() {
              projection.on_remove(function() {});
            });

            it("does not destroy the #on_insert and #on_update subscriptions on #operand", function() {
              mock(projection.operand_subscription_bundle, 'destroy_all')
              subscription.destroy();
              expect(projection.operand_subscription_bundle.destroy_all).to_not(have_been_called);
            });
          });
        });
      });

      describe("#on_update subscriptions", function() {
        describe("when an #on_update subscription is registered", function() {
          context("when this is the first subscription", function() {
            before(function() {
              expect(projection.has_subscribers()).to(be_false);
            });

            it("subscribes #on_insert, #on_remove, and #on_update on #operand", function() {
              mock(operand, 'on_insert');
              mock(operand, 'on_remove');
              mock(operand, 'on_update');

              projection.on_update(function() {});

              expect(operand.on_insert).to(have_been_called);
              expect(operand.on_remove).to(have_been_called);
              expect(operand.on_update).to(have_been_called);
            });
          });

          context("when this is not the first subscription", function() {
            before(function() {
              projection.on_update(function() {});
            });

            it("does not subscribe to #operand", function() {
              mock(operand, 'on_insert');
              mock(operand, 'on_remove');
              mock(operand, 'on_update');

              projection.on_update(function() {});

              expect(operand.on_insert).to_not(have_been_called);
              expect(operand.on_remove).to_not(have_been_called);
              expect(operand.on_update).to_not(have_been_called);
            });
          });
        });

        describe("when an #on_update subscription is destroyed", function() {
          var subscription;
          before(function() {
            subscription = projection.on_update(function() {});
          });

          context("when it is the last subscription to be destroyed", function() {
            it("destroys the #on_insert and #on_update subscriptions on #operand", function() {
              mock(projection.operand_subscription_bundle, 'destroy_all')
              subscription.destroy();
              expect(projection.operand_subscription_bundle.destroy_all).to(have_been_called);
            });
          });

          context("when it is not the last subscription to be destroyed", function() {
            before(function() {
              projection.on_update(function() {});
            });

            it("does not destroy the #on_insert and #on_update subscriptions on #operand", function() {
              mock(projection.operand_subscription_bundle, 'destroy_all')
              subscription.destroy  ();
              expect(projection.operand_subscription_bundle.destroy_all).to_not(have_been_called);
            });
          });
        });
      });
    });
  });
}});