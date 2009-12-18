(function(Monarch, jQuery) {

Monarch.constructor("Monarch.Model.Predicates.And", Monarch.Model.Predicates.Predicate, {
  initialize: function(operands) {
    this.operands = operands;
  },

  evaluate: function(record) {
    return Monarch.Util.all(this.operands, function(operand) {
      return operand.evaluate(record);
    });
  },

  wire_representation: function() {
    return {
      type: "and",
      operands: Monarch.Util.map(this.operands, function(operand) {
        return operand.wire_representation();
      })
    };
  },

  force_matching_field_values: function(field_values) {
    return Monarch.Util.inject(this.operands, field_values, function(accumulated_field_values, operand) {
      return operand.force_matching_field_values(accumulated_field_values);
    });
  }
});

})(Monarch, jQuery);
