require("/specs/june_spec_helper");

Screw.Unit(function(c) { with(c) { 
  describe("Attribute", function() {

    describe("#convert", function() {
      var attribute;

      describe("when called with null", function() {
        it("returns null", function() {
          expect(User.first_name.convert(null)).to(equal, null);
        });
      });
      
      describe("when the Attribute's #type is 'string'", function() {
        before(function() {
          attribute = User.first_name;
          expect(attribute.type).to(equal, 'string');
        });

        it("converts integers to Strings", function() {
          var converted = attribute.convert(420);
          expect(typeof converted).to(equal, "string");
          expect(converted).to(equal, '420');
        });

        it("leaves Strings as Strings", function() {
          var converted = attribute.convert('420');
          expect(typeof converted).to(equal, "string");
          expect(converted).to(equal, '420');
        });
      });

      describe("when the Attribute's #type is 'integer'", function() {
        before(function() {
          attribute = User.age;
          expect(attribute.type).to(equal, 'integer');
        });

        it("converts Strings to integers", function() {
          var converted = attribute.convert('420');
          expect(typeof converted).to(equal, "number");
          expect(converted).to(equal, 420);
        });

        it("leaves integers as integers", function() {
          var converted = attribute.convert(420);
          expect(typeof converted).to(equal, "number");
          expect(converted).to(equal, 420);
        });
      });

      describe("when the Attribute's #type is 'datetime'", function() {
        before(function() {
          attribute = User.dob;
          expect(attribute.type).to(equal, 'datetime');
        });

        it("converts integer representions of milliseconds since the epoch to Dates", function() {
          var converted = attribute.convert(420);
          expect(converted instanceof Date).to(be_true);
          expect(converted.getTime()).to(equal, new Date(420).getTime());
        });

        it("converts String representions of milliseconds since the epoch to Dates", function() {
          var converted = attribute.convert('420');
          expect(converted instanceof Date).to(be_true);
          expect(converted.getTime()).to(equal, new Date(420).getTime());
        });

        it("leaves Dates as Dates", function() {
          var converted = attribute.convert(new Date(420));
          expect(converted instanceof Date).to(be_true);
          expect(converted.getTime()).to(equal, new Date(420).getTime());
        });
      });
    });

    describe("#eq", function() {
      it("returns an EqualTo predicate", function() {
        var predicate = User.id.eq("nathan");
        expect(predicate.constructor).to(equal, June.Predicates.EqualTo);
        expect(predicate.operand_1).to(equal, User.id);
        expect(predicate.operand_2).to(equal, "nathan");
      });
    });

    describe("#neq", function() {
      it("returns a NotEqualTo predicate", function() {
        var predicate = User.id.neq("nathan");
        expect(predicate.constructor).to(equal, June.Predicates.NotEqualTo);
        expect(predicate.operand_1).to(equal, User.id);
        expect(predicate.operand_2).to(equal, "nathan");
      });
    });
  });
}});