require("/specs/june_spec_helper");

Screw.Unit(function(c) { with(c) {
  describe("Predicates.EqualTo", function() {
    var predicate;

    describe("#evaluate", function() {
      describe("when #operand_1 is an Attribute and #operand_2 is a constant", function() {
        describe("when passed a Tuple with a field value for the Attribute that =='s the constant", function() {
          before(function() {
            predicate = new June.Predicates.EqualTo(User.first_name, "Nathan");
          });

          it("returns true", function() {
            expect(predicate.evaluate(User.local_create({first_name: "Nathan"}))).to(equal, true);
          });
        });

        describe("when passed a Tuple with a field value for the Attribute that !='s the constant", function() {
          before(function() {
            predicate = new June.Predicates.EqualTo(User.first_name, "Nate");
          });

          it("returns false", function() {
            expect(predicate.evaluate(User.local_create({first_name: "Nathan"}))).to(equal, false);
          });
        });
      });

      describe("when #operand_1 is a constant and #operand_2 is an Attribute", function() {
        describe("when passed a Tuple with a field value for the Attribute that =='s the constant", function() {
          before(function() {
            predicate = new June.Predicates.EqualTo("Nathan", User.first_name);
          });

          it("returns true", function() {
            expect(predicate.evaluate(User.local_create({first_name: "Nathan"}))).to(equal, true);
          });
        });

        describe("when passed a Tuple with a field value for the Attribute that !='s the constant", function() {
          before(function() {
            predicate = new June.Predicates.EqualTo("Nate", User.first_name);
          });

          it("returns false", function() {
            expect(predicate.evaluate(User.local_create({first_name: "Nathan"}))).to(equal, false);
          });
        });
      });

      describe("when #operand_1 is null and #operand_2 is an Attribute", function() {
        before(function() {
          predicate = new June.Predicates.EqualTo(null, User.first_name);
        });

        describe("when passed a Tuple with a field value for the Attribute that is null", function() {
          it("returns true", function() {
            expect(predicate.evaluate(User.local_create({first_name: null}))).to(equal, true);
          });
        });

        describe("when passed a Tuple with a field value for the Attribute that is not null", function() {
          it("returns false", function() {
            expect(predicate.evaluate(User.local_create({first_name: "Nathan"}))).to(equal, false);
          });
        });
      });
    });

    describe("#wire_representation", function() {
      context("when both the operands are scalar", function() {
        it("returns the JSON representation of the Predicate and both its operands", function() {
          predicate = new June.Predicates.EqualTo(1, 2);
          expect(predicate.wire_representation()).to(equal, {
            type: "eq",
            left_operand: {
              type: "scalar",
              value: 1
            },
            right_operand: {
              type: "scalar",
              value: 2
            }
          });
        });
      });

      context("when one of the operands is an attribute", function() {
        it("returns the JSON representation of the Predicate and both its operands", function() {
          predicate = new June.Predicates.EqualTo(User.first_name, "Nathan");
          expect(predicate.wire_representation()).to(equal, {
            type: "eq",
            left_operand: {
              type: "attribute",
              set: "users",
              name: "first_name"
            },
            right_operand: {
              type: "scalar",
              value: "Nathan"
            }
          });
        });
      });
    });
  });
}});