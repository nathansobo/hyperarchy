(function(Monarch) {

_.constructor("Monarch.Model.Predicates.Eq", Monarch.Model.Predicates.Binary, {
  operator: function(left, right) {
    return left == right;
  },

  type: "eq",

  forceMatchingFieldValues: function(fieldValues) {
    var matchingFieldValues = _.clone(fieldValues);
    matchingFieldValues[this.columnOperand().name] = this.scalarOperand();
    return matchingFieldValues;
  }
});

})(Monarch);
