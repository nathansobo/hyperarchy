(function(Monarch) {

_.constructor("Monarch.Model.Predicates.Lte", Monarch.Model.Predicates.Binary, {
  operator: function(left, right) {
    return left <= right;
  },

  type: "lte",

  forceMatchingFieldValues: function(fieldValues) {
    throw new Error("Can only force a field value for equality predicates");
  }
});

})(Monarch);
