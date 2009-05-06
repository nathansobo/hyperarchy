require("/specs/june_spec_helper");

Screw.Unit(function(c) { with(c) {
  describe("CompositeTuple", function() {
    var flat_left, flat_right, flat, deep_on_the_left, deep_on_the_right;

    before(function() {
      flat_left = User.find("bob");
      flat_right = Pet.find("blue");
      flat = new June.CompositeTuple(flat_left, flat_right);

      deep_on_the_left = new June.CompositeTuple(new June.CompositeTuple(User.find("bob"), Pet.find("blue")), Species.find("dog"));
      deep_on_the_right = new June.CompositeTuple(User.find("bob"), new June.CompositeTuple(Pet.find("blue"), Species.find("dog")));
    });

    describe("#get_field_value", function() {

      context("when #right and #left are primitive tuples", function() {
        context("given an Attribute of the left tuple", function() {
          it("delegates to the left tuple", function() {
            expect(flat.get_field_value(User.first_name)).to(equal, flat_left.first_name());
          });
        });

        context("given an Attribute of the right tuple", function() {
          it("delegates to the right tuple", function() {
            expect(flat.get_field_value(Pet.owner_id)).to(equal, flat_right.owner_id());
          });
        });
      });

      context("when #left is a CompositeTuple", function() {
        context("given an Attribute a tuple in the #left CompositeTuple", function() {
          it("returns the value of that Attribute", function() {
            expect(deep_on_the_left.get_field_value(Pet.name)).to(equal, Pet.find("blue").name());
          });
        });
      });

      context("when #right is a CompositeTuple", function() {
        context("given an Attribute a tuple in the #right CompositeTuple", function() {
          it("returns the value of that Attribute", function() {
            expect(deep_on_the_right.get_field_value(Pet.name)).to(equal, Pet.find("blue").name());
          });
        });
      });
    });

    describe("#tuple_for_set", function() {
      describe("when the #left tuple is a member of the given Set", function() {
        it("returns that tuple", function() {
          expect(flat.tuple_for_set(User)).to(equal, User.find("bob"));
        });
      });

      describe("when the #right tuple is a member of the given Set", function() {
        it("returns that tuple", function() {
          expect(flat.tuple_for_set(Pet)).to(equal, Pet.find("blue"));
        });
      });

      describe("when the #left CompositeTuple contains a tuple that is a member of the given Set", function() {
        it("returns that tuple", function() {
          expect(deep_on_the_left.tuple_for_set(Pet)).to(equal, Pet.find("blue"));
        });
      });

      describe("when the #right CompositeTuple contains a tuple that is a member of the given Set", function() {
        it("returns that tuple", function() {
          expect(deep_on_the_right.tuple_for_set(Species)).to(equal, Species.find("dog"));
        });
      });

      describe("when neither the #left nor the #right returns a tuple from #tuple_for_set", function() {
        it("returns null", function() {
          expect(flat.tuple_for_set(Species)).to(equal, null);
        });
      });
    });

    describe("#has_attribute", function() {
      context("when #left.has_attribute returns true", function() {
        it("returns true", function() {
          expect(deep_on_the_left.has_attribute(Pet.name)).to(be_true);
        });
      });

      context("when #right.has_attribute returns true", function() {
        it("returns true", function() {
          expect(deep_on_the_right.has_attribute(Pet.name)).to(be_true);
        });
      });

      context("when neither #left.has_attribute nor #right.has_attribute returns true", function() {
        it("returns false", function() {
          expect(flat.has_attribute(Species.id)).to(be_false);
        });
      });
    });
  });
}});
