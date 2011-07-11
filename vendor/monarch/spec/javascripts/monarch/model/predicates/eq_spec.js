//= require monarch_spec_helper

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Predicates.Eq", function() {
    useLocalFixtures();

    var eqPredicate, leftOperand, rightOperand, record;
    before(function() {
      eqPredicate = new Monarch.Model.Predicates.Eq(leftOperand, rightOperand)
      record = User.fixture("jan");
    });

    describe("#evaluate", function() {
      context("when #leftOperand and #rightOperand are scalars", function() {
        context("when #leftOperand and #rightOperand are equivalent", function() {
          init(function() {
            leftOperand = 1;
            rightOperand = 1;
          });

          it("returns true", function() {
            expect(eqPredicate.evaluate(record)).to(beTrue);
          });
        });

        scenario("when #leftOperand and #rightOperand are not equivalent", function() {
          init(function() {
            leftOperand = 4;
            rightOperand = 1;
          });

          it("returns false", function() {
            expect(eqPredicate.evaluate(record)).to(beFalse);
          });
        });
      });

      context("when one operand is a column and one is a scalar", function() {
        scenario("when the left operand is a column", function() {
          init(function() {
            leftOperand = User.fullName;
            rightOperand = "Jan Nelson";
          });
        });

        scenario("when the right operand is a column", function() {
          init(function() {
            rightOperand = User.fullName;
            leftOperand = "Jan Nelson";
          });
        });

        context("when field value corresponding to the column in the given record is equivalent to the scalar", function() {
          before(function() {
            expect(record.fullName()).to(eq, "Jan Nelson");
          });

          it("returns true", function() {
            expect(eqPredicate.evaluate(record)).to(beTrue);
          });
        });

        context("when field value corresponding to the column in the given record is NOT equivalent to the scalar", function() {
          before(function() {
            record.fullName("Jan Christian Nelson");
          });

          it("returns true", function() {
            expect(eqPredicate.evaluate(record)).to(beFalse);
          });
        });
      });
    });
  });
}});
