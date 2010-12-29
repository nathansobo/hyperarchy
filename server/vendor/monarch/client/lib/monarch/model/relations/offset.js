(function(Monarch) {

_.constructor("Monarch.Model.Relations.Offset", Monarch.Model.Relations.Relation, {
  initialize: function(operand, n) {
    this.operand = operand;
    this.n = n;
    this.initializeEventsSystem();
  },

  allTuples: function() {
    return this.operand.allTuples().slice(this.n);
  },

  wireRepresentation: function() {
    return {
      type: "offset",
      operand: this.operand.wireRepresentation(),
      n: this.n
    };
  },

  subscribeToOperands: function() {
    this.operandsSubscriptionBundle.add(this.operand.onRemoteInsert(function(record, index) {
      if (index < this.n) {
        var nthTuple = this.operand.at(this.n);
        if (nthTuple) this.tupleInsertedRemotely(nthTuple);
      } else {
        this.tupleInsertedRemotely(record);
      }
    }, this));
  }

});

})(Monarch);