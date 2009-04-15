module("June", function(c) { with(c) {
  module("Predicates", function(c) {
    constructor("NotEqualTo", function() {
      include(June.Predicates.PredicateMethods);
      include(June.Predicates.BinaryPredicateMethods);

      def('evaluate', function(tuple) {
        return this.evaluate_operand(tuple, this.operand_1) != this.evaluate_operand(tuple, this.operand_2);
      });

      def("wire_representation_type", function() {
        return "neq";
      });
    });
  });
}});