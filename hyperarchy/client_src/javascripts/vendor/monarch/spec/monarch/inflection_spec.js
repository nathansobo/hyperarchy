//= require "../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("_", function() {
    describe(".humanize", function() {
      it("breaks underscored or camelhumps words into space separated words", function() {
        expect(_.humanize("fastCars")).to(eq, "Fast Cars");
        expect(_.humanize("FastCars")).to(eq, "Fast Cars");
      });
    });
  });
}});
