module("June", function(c) { with(c) {
  module("Predicates", function() {
    module("BinaryPredicateMethods", function() {
      def("wire_representation", function() {
        return {
          type: this.wire_representation_type(),
          left_operand: this.operand_wire_representation(this.operand_1),
          right_operand: this.operand_wire_representation(this.operand_2)
        };
      });

      def("operand_wire_representation", function(operand) {
        if (typeof operand == "object") {
          return {
            type: "attribute",
            set: operand.set.global_name,
            name: operand.name
          };
        } else {
          return {
            type: "scalar",
            value: operand
          };
        }
      });
    });
  });
}});