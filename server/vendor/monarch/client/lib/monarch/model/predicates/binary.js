(function(Monarch) {

_.constructor("Monarch.Model.Predicates.Binary", Monarch.Model.Predicates.Predicate, {
  initialize: function(leftOperand, rightOperand) {
    this.leftOperand = leftOperand;
    this.rightOperand = rightOperand;
  },

  evaluate: function(tuple) {
    return this.operator(tuple.evaluate(this.leftOperand), tuple.evaluate(this.rightOperand));
  },

  wireRepresentation: function() {
    return {
      type: this.type,
      left_operand: this.operandWireRepresentation(this.leftOperand),
      right_operand: this.operandWireRepresentation(this.rightOperand)
    };
  },

  columnOperand: function() {
    if (this.leftOperand instanceof Monarch.Model.Column) {
      return this.leftOperand;
    } else if (this.rightOperand instanceof Monarch.Model.Column) {
      return this.rightOperand;
    } else {
      throw new Error("No operands are columns on this predicate");
    }
  },

  scalarOperand: function() {
    if (!(this.leftOperand instanceof Monarch.Model.Column)) {
      return this.leftOperand;
    } else if (!(this.rightOperand instanceof Monarch.Model.Column)) {
      return this.rightOperand;
    } else {
      throw new Error("No operands are scalars on this predicate");
    }
  },

  operandWireRepresentation: function(operand) {
    if (operand instanceof Monarch.Model.Column) {
      return operand.wireRepresentation();
    } else {
      return {
        type: 'scalar',
        value: operand
      };
    }
  }
});

})(Monarch);
