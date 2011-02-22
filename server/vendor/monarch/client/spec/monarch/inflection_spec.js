//= require "../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("_", function() {
    describe(".humanize", function() {
      it("breaks underscored or camelhumps words into space separated words", function() {
        expect(_.humanize("fastCars")).to(eq, "Fast Cars");
        expect(_.humanize("FastCars")).to(eq, "Fast Cars");
      });
    });

    describe(".singularize", function() {
      it("leaves singular words unchanged", function() {
        expect(_.singularize("cars")).to(eq, "car");
        expect(_.singularize("car")).to(eq,  "car");
      });

      it("returns the singular form of irregular plural words", function() {
        expect(_.singularize("people")).to(eq, "person");
        expect(_.singularize("People")).to(eq, "Person");
        expect(_.singularize("person")).to(eq, "person");
        expect(_.singularize("Person")).to(eq, "Person");
      });
    });
  });
}});
