(function(Monarch, jQuery) {

Monarch.constructor("Monarch.Model.Predicates.And", Monarch.Model.Predicates.Predicate, {
  initialize: function(operands) {
    this.operands = operands;
  },

  evaluate: function(record) {
    return _.all(this.operands, function(operand) {
      return operand.evaluate(record);
    });
  },

  wireRepresentation: function() {
    return {
      type: "and",
      operands: _.map(this.operands, function(operand) {
        return operand.wireRepresentation();
      })
    };
  },

  forceMatchingFieldValues: function(fieldValues) {
    return _.inject(this.operands, fieldValues, function(accumulatedFieldValues, operand) {
      return operand.forceMatchingFieldValues(accumulatedFieldValues);
    });
  }
});

})(Monarch, jQuery);
