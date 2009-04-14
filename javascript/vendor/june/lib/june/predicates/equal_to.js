module("June", function(c) { with(c) {
  module("Predicates", function() {
    constructor("EqualTo", function() {
      include(June.Predicates.PredicateMethods);

      def('evaluate', function(tuple) {
        return this.evaluate_operand(tuple, this.operand_1) == this.evaluate_operand(tuple, this.operand_2);
      });
    });
  });
}});