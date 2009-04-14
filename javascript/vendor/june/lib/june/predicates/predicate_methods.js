module("June", function(c) { with(c) {
  module("Predicates", function(c) {
    module("PredicateMethods", function() {
      def('initialize', function(operand_1, operand_2) {
        this.operand_1 = operand_1;
        this.operand_2 = operand_2;
      });

      def('evaluate_operand', function(tuple, operand) {
        if (operand && operand.constructor == June.Attribute) {
          return tuple.get_field_value(operand)
        } else {
          return operand;
        }
      });
    });
  });
}});
