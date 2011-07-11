(function(Monarch) {

_.constructor("Monarch.Model.Predicates.Neq", Monarch.Model.Predicates.Binary, {
  operator: function(left, right) {
    return left != right;
  },

  type: "neq"
});

})(Monarch);
