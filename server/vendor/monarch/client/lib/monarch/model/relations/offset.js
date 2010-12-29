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
        if (nthTuple) this.tupleInsertedRemotely(nthTuple, 0);
      } else {
        this.tupleInsertedRemotely(record, index - this.n);
      }
    }, this));

    this.operandsSubscriptionBundle.add(this.operand.onRemoteUpdate(function(record, changeset, newIndex, oldIndex) {
      if (oldIndex < this.n) {
        if (newIndex >= this.n) {
          this.tupleRemovedRemotely(this.operand.at(this.n - 1), 0);
          this.tupleInsertedRemotely(record, newIndex - this.n);
        }
      } else {
        if (newIndex < this.n) {
          this.tupleRemovedRemotely(record, oldIndex - this.n);
          this.tupleInsertedRemotely(this.operand.at(this.n), 0);
        } else {
          this.tupleUpdatedRemotely(record, changeset, newIndex - this.n, oldIndex - this.n);
        }
      }
    }, this));


    this.operandsSubscriptionBundle.add(this.operand.onRemoteRemove(function(record, index) {
      if (index < this.n) {
        var formerNthTuple = this.operand.at(this.n - 1);
        if (formerNthTuple) this.tupleRemovedRemotely(formerNthTuple, 0);
      } else {
        this.tupleRemovedRemotely(record, index - this.n);
      }
    }, this));
  }


});

})(Monarch);