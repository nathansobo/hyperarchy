//= require monarch_spec_helper

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Predicates.And", function() {
    useLocalFixtures();

    var and, operand1, operand2, operand3, record;
    before(function() {
      operand1 = User.id.eq("jan");
      operand3 = User.age.eq(34);
      and = new Monarch.Model.Predicates.And([operand1, operand2])
      record = User.fixture("jan");
    });

    init(function() {
      operand2 = User.fullName.eq("Jan Nelson");
    })

    describe("#evaluate", function() {
      context("when both expressions evaluate to true", function() {
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
      it("converts the flat list of operands into a binary tree structure", function() {
        expect(and.wireRepresentation()).to(equal, {
          type: 'and',
          left_operand: operand1.wireRepresentation(),
          right_operand: operand2.wireRepresentation()
        });

        var tripleAnd = new Monarch.Model.Predicates.And([operand1, operand2, operand3])
        expect(tripleAnd.wireRepresentation()).to(equal, {
          type: 'and',
          left_operand: operand1.wireRepresentation(),
          right_operand: {
            type: 'and',
            left_operand: operand2.wireRepresentation(),
            right_operand: operand3.wireRepresentation()
          }
        });
      });

      init(function() {
        operand2 = User.fullName.eq("Jan Nelson");
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

    describe("isEqual", function() {
      it("returns true if it ands together all the same operands, regardless of order", function() {
        var and1 = new Monarch.Model.Predicates.And([operand1, operand2, operand3])
        var and2 = new Monarch.Model.Predicates.And([operand3, operand2, operand1])
        expect(and1.isEqual(and2)).to(beTrue);


        var and3 = new Monarch.Model.Predicates.And([operand1, operand2])
        expect(and3.isEqual(and1)).to(beFalse);
        expect(and1.isEqual(and3)).to(beFalse);

        var and4 = new Monarch.Model.Predicates.And([operand1, operand3]);
        expect(and3.isEqual(and4)).to(beFalse);

        expect(and4.isEqual(2)).to(beFalse);
      });
    });
  });
}});
