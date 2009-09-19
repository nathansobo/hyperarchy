constructor("Model.Predicates.Eq", {
  initialize: function(left_operand, right_operand) {
    this.left_operand = left_operand;
    this.right_operand = right_operand;
  },

  evaluate: function(record) {
    return record.evaluate(this.left_operand) == record.evaluate(this.right_operand);
  },

  wire_representation: function() {
    return {
      type: "eq",
      left_operand: this.operand_wire_representation(this.left_operand),
      right_operand: this.operand_wire_representation(this.right_operand)
    };
  },

  operand_wire_representation: function(operand) {
    if (operand instanceof Model.Column) {
      return operand.wire_representation();
    } else {
      return {
        type: 'scalar',
        value: operand
      };
    }
  }

});
