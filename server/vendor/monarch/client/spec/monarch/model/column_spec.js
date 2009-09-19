//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Model.Column", function() {
    use_local_fixtures();

    describe("#eq", function() {
      it("returns an Eq predicate with the Column as the #left_operand an the argument as the #right_operand", function() {
        var pred = Blog.id.eq('recipes');
        expect(pred.constructor).to(equal, Model.Predicates.Eq);
        expect(pred.left_operand).to(equal, Blog.id);
        expect(pred.right_operand).to(equal, 'recipes');
      });
    });
  });
}});
