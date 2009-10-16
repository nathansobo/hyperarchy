(function(Monarch, jQuery) {

Monarch.constructor("Monarch.Model.Predicates.Eq", {
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

  force_matching_field_values: function(field_values) {
    var matching_field_values = jQuery.extend({}, field_values);
    matching_field_values[this.column_operand().name] = this.scalar_operand();
    return matching_field_values;
  },

  column_operand: function() {
    if (this.left_operand instanceof Monarch.Model.Column) {
      return this.left_operand;
    } else if (this.right_operand instanceof Monarch.Model.Column) {
      return this.right_operand;
    } else {
      throw new Error("No operands are columns on this predicate");
    }
  },

  scalar_operand: function() {
    if (!(this.left_operand instanceof Monarch.Model.Column)) {
      return this.left_operand;
    } else if (!(this.right_operand instanceof Monarch.Model.Column)) {
      return this.right_operand;
    } else {
      throw new Error("No operands are scalars on this predicate");
    }
  },

  operand_wire_representation: function(operand) {
    if (operand instanceof Monarch.Model.Column) {
      return operand.wire_representation();
    } else {
      return {
        type: 'scalar',
        value: operand
      };
    }
  }
});

})(Monarch, jQuery);
