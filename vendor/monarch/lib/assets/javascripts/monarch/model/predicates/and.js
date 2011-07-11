(function(Monarch, jQuery) {

_.constructor("Monarch.Model.Predicates.And", Monarch.Model.Predicates.Predicate, {
  initialize: function(operands) {
    this.operands = operands;
  },

  evaluate: function(record) {
    return _.all(this.operands, function(operand) {
      return operand.evaluate(record);
    });
  },

  wireRepresentation: function() {
    return this.buildWireRepresentation(this.operands);
  },

  buildWireRepresentation: function(operands) {
    if (operands.length == 1) {
      return _.first(operands).wireRepresentation();
    } else {
      return {
        type: "and",
        left_operand: _.first(operands).wireRepresentation(),
        right_operand: this.buildWireRepresentation(_.rest(operands))
      }
    }
  },

  forceMatchingFieldValues: function(fieldValues) {
    return _.inject(this.operands, fieldValues, function(accumulatedFieldValues, operand) {
      return operand.forceMatchingFieldValues(accumulatedFieldValues);
    });
  },

  isEqual: function(other) {
    if (other.constructor !== Monarch.Model.Predicates.And) return false;
    if (this.operands.length !== other.operands.length) return false;

    for (var i = 0; i < this.operands.length; i++) {
      var operand = this.operands[i];
      var otherHasEquivalentOperand = _.any(other.operands, function(otherOperand) {
        return operand.isEqual(otherOperand);
      });
      if (!otherHasEquivalentOperand) return false;
    }
    return true;
  }
});

})(Monarch, jQuery);
