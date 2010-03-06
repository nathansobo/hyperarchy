//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Predicates.And", function() {
    useLocalFixtures();

    var and, operand1, operand2, record;
    before(function() {
      operand1 = User.id.eq("jan");
      and = new Monarch.Model.Predicates.And([operand1, operand2])
      record = User.find("jan");
    });

    init(function() {
      operand2 = User.fullName.eq("Jan Nelson");
    })

    describe("#evaluate", function() {
      context("when both predicates evaluate to true", function() {
        it("returns true", function() {
          expect(operand1.evaluate(record)).to(beTrue);
          expect(operand2.evaluate(record)).to(beTrue);
          expect(and.evaluate(record)).to(beTrue);
        });
      });

      context("when a predicate evaluets to false", function() {
        init(function() {
          operand2 = User.fullName.eq("Evil Evil Man");
        });

        it("returns false", function() {
          expect(operand1.evaluate(record)).to(beTrue);
          expect(operand2.evaluate(record)).to(beFalse);
          expect(and.evaluate(record)).to(beFalse);
        });
      });
    });

    describe("#wireRepresentation", function() {
      it("contains the wire representations of the operands", function() {
        expect(and.wireRepresentation()).to(equal, {
          type: 'and',
          operands: [
            operand1.wireRepresentation(),
            operand2.wireRepresentation()
          ]
        });
      });
    });
    
    describe("#forceMatchingFieldValues", function() {
      it("returns a hash that matches the required field values of all the operands", function() {
        var hash = {
          foo: "narnar"
        }
        expect(and.forceMatchingFieldValues(hash)).to(equal, {
          foo: "narnar",
          id: "jan",
          fullName: "Jan Nelson"
        });
        expect(hash).to(equal, {
          foo: "narnar"
        });
      });
    });
  });
}});
