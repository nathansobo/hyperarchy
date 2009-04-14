require("/specs/june_spec_helper");

Screw.Unit(function(c) { with(c) {
  describe("The generated Set.Tuple constructor associated with each Set", function() {
    var tuple;
    before(function() {
      tuple = User.find("bob");
    });

    describe("#destroy", function() {
      it("calls #remove on the tuple's #set with the tuple", function() {
        mock(User, 'remove');
        tuple.destroy();
        expect(User.remove).to(have_been_called, once);
        expect(User.remove).to(have_been_called, with_args(tuple));
      });
    });
    
    describe("#get_field_value", function() {
      describe("when called with an Attribute that is defined on the Set", function() {
        it("retrieves the value in the corresponding Field", function() {
          tuple.set_field_value(tuple.set.first_name, "Wil");
          expect(tuple.get_field_value(tuple.set.first_name)).to(equal, "Wil");
        });
      });

      describe("when called with a value that is not a defined Attribute on the Set", function() {
        it("raises an exception", function() {
          var exception;
          try {
            tuple.get_field_value(Pet.owner_id);
          } catch(e) {
            exception = e;
          }
          expect(exception).to_not(equal, undefined);
        });
      });
    });

    describe("#set_field_value", function() {
      before(function() {
        mock(tuple.set, 'tuple_updated');
      });

      describe("when called with an Attribute that is defined on the Set", function() {
        it("stores the value in the corresponding Field", function() {
          tuple.set_field_value(tuple.set.first_name, "Wil");
          expect(tuple.get_field_value(tuple.set.first_name)).to(equal, "Wil");
        });

        context("when the new value is different than the old value", function() {
          context("when #update_notification_enabled is true", function() {
            before(function() {
              expect(tuple.update_notification_enabled).to(be_true);
            });

            it("calls #tuple_updated on the tuple's #set with the updated tuple and a changed attributes object", function() {
              var old_value = tuple.age();
              var new_value = old_value + 1;

              tuple.set_field_value(tuple.set.age, new_value);
              expect(tuple.set.tuple_updated).to(have_been_called, once);

              var changed_attributes = tuple.set.tuple_updated.most_recent_args[1];
              expect(changed_attributes.age.old_value).to(equal, old_value);
              expect(changed_attributes.age.new_value).to(equal, new_value);
              expect(changed_attributes.age.attribute).to(equal, tuple.set.age);
            });
          });

          context("when #update_notification_enabled is false", function() {
            before(function() {
              tuple.update_notification_enabled = false;
            });

            it("does not call #tuple_updated on the tuple's #set", function() {
              var old_value = tuple.age();
              var new_value = old_value + 1;

              tuple.set_field_value(tuple.set.age, new_value);
              expect(tuple.set.tuple_updated).to_not(have_been_called);
            });
          });
        });

        context("when the new value is the same as the old value", function() {
          it("calls #tuple_updated on the tuple's #set", function() {
            tuple.set_field_value(tuple.set.age, tuple.age());
            expect(tuple.set.tuple_updated).to_not(have_been_called, with_args(tuple));
          });
          
        });
      });

      describe("when called value that is not a defined Attribute on the Set", function() {
        it("raises an exception", function() {
          var exception;
          try {
            tuple.set_field_value("first_name", "Moo");
          } catch(e) {
            exception = e;
          }
          expect(exception).to_not(equal, undefined);
        });
      });
    });

    describe("#tuple_for_set", function() {
      describe("when passed the parent Set", function() {
        it("returns itself", function() {
          expect(tuple.tuple_for_set(User)).to(equal, tuple);
        });
      });

      describe("when passed a Set other than the parent Set", function() {
        it("returns null", function() {
          expect(tuple.tuple_for_set(Pet)).to(equal, null);
        });
      });
    });

    describe("#has_attribute", function() {
      context("when the given Attribute's #set matches the tuple's #set", function() {
        it("returns true", function() {
          expect(tuple.has_attribute(User.id)).to(be_true);
        });
      });

      context("when the given Attribute's #set does not match the tuple's #set", function() {
        it("returns false", function() {
          expect(tuple.has_attribute(Pet.id)).to(be_false);
        });
      });
    });

    describe("#update", function() {
      context("when called with Attribute values that are different from the existing values", function() {
        it("updates multiple Attribute values simultaneously", function() {
          expect(tuple.first_name()).to_not(equal, "Bobo");
          expect(tuple.age()).to_not(equal, 100);

          tuple.update({ first_name: "Bobo", age: 100 });

          expect(tuple.first_name()).to(equal, "Bobo");
          expect(tuple.age()).to(equal, 100);
        });

        it("calls #tuple_updated on the tuple's #set once with all changed attributes", function() {
          mock(tuple.set, 'tuple_updated');
          var attributes = { first_name: "Bobo", age: 99 };
          var expected_changed_attributes = {
            first_name: {
              attribute: tuple.set.first_name,
              old_value: tuple.first_name(),
              new_value: attributes['first_name']
            },
            age: {
              attribute: tuple.set.age,
              old_value: tuple.age(),
              new_value: attributes['age']
            }
          }
          tuple.update(attributes);

          expect(tuple.set.tuple_updated).to(have_been_called, once);
          expect(tuple.set.tuple_updated).to(have_been_called, with_args(tuple, expected_changed_attributes));
        });
      });

      context("when called with Attribute values that are the same as the existing values", function() {
        it("does not call #tuple_updated on its #set", function() {
          mock(tuple.set, "tuple_updated");
          tuple.update({ first_name: tuple.first_name(), age: tuple.age() });
          expect(tuple.set.tuple_updated).to_not(have_been_called);
        });
      });
    });
  });
}});