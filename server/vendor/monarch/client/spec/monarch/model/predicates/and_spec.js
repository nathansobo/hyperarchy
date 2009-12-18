//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Predicates.And", function() {
    use_local_fixtures();

    var and, operand_1, operand_2, record;
    before(function() {
      operand_1 = User.id.eq("jan");
      and = new Monarch.Model.Predicates.And([operand_1, operand_2])
      record = User.find("jan");
    });

    init(function() {
      operand_2 = User.full_name.eq("Jan Nelson");
    })

    describe("#evaluate", function() {
      context("when both predicates evaluate to true", function() {
        it("returns true", function() {
          expect(operand_1.evaluate(record)).to(be_true);
          expect(operand_2.evaluate(record)).to(be_true);
          expect(and.evaluate(record)).to(be_true);
        });
      });

      context("when a predicate evaluets to false", function() {
        init(function() {
          operand_2 = User.full_name.eq("Evil Evil Man");
        });

        it("returns false", function() {
          expect(operand_1.evaluate(record)).to(be_true);
          expect(operand_2.evaluate(record)).to(be_false);
          expect(and.evaluate(record)).to(be_false);
        });
      });
    });

    describe("#wire_representation", function() {
      it("contains the wire representations of the operands", function() {
        expect(and.wire_representation()).to(equal, {
          type: 'and',
          operands: [
            operand_1.wire_representation(),
            operand_2.wire_representation()
          ]
        });
      });
    });
    
    describe("#force_matching_field_values", function() {
      it("returns a hash that matches the required field values of all the operands", function() {
        var hash = {
          foo: "narnar"
        }
        expect(and.force_matching_field_values(hash)).to(equal, {
          foo: "narnar",
          id: "jan",
          full_name: "Jan Nelson"
        });
        expect(hash).to(equal, {
          foo: "narnar"
        });
      });
    });
  });
}});
