//= require "../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Inflection", function() {
    describe(".humanize", function() {
      it("breaks underscored or camelhumps words into space separated words", function() {
        expect(Monarch.Inflection.humanize("fastCars")).to(equal, "Fast Cars");
        expect(Monarch.Inflection.humanize("FastCars")).to(equal, "Fast Cars");
      });
    });
  });
}});
