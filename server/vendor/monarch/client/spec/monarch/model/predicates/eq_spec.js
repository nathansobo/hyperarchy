//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Model.Predicates.Eq", function() {
    use_local_fixtures();

    var eq, left_operand, right_operand, record;
    before(function() {
      eq = new Model.Predicates.Eq(left_operand, right_operand)
      record = User.find("jan");
    });

    describe("#evaluate", function() {
      context("when #left_operand and #right_operand are scalars", function() {
        context("when #left_operand and #right_operand are equivalent", function() {
          init(function() {
            left_operand = 1;
            right_operand = 1;
          });

          it("returns true", function() {
            expect(eq.evaluate(record)).to(be_true);
          });
        });

        scenario("when #left_operand and #right_operand are not equivalent", function() {
          init(function() {
            left_operand = 4;
            right_operand = 1;
          });

          it("returns false", function() {
            expect(eq.evaluate(record)).to(be_false);
          });
        });
      });

      context("when one operand is a column and one is a scalar", function() {
        scenario("when the left operand is a column", function() {
          init(function() {
            left_operand = User.full_name;
            right_operand = "Jan Nelson";
          });
        });

        scenario("when the right operand is a column", function() {
          init(function() {
            right_operand = User.full_name;
            left_operand = "Jan Nelson";
          });
        });

        context("when field value corresponding to the column in the given record is equivalent to the scalar", function() {
          before(function() {
            expect(record.full_name()).to(equal, "Jan Nelson");
          });

          it("returns true", function() {
            expect(eq.evaluate(record)).to(be_true);
          });
        });

        context("when field value corresponding to the column in the given record is NOT equivalent to the scalar", function() {
          before(function() {
            record.full_name("Jan Christian Nelson");
          });

          it("returns true", function() {
            expect(eq.evaluate(record)).to(be_false);
          });
        });
      });
    });
  });
}});
