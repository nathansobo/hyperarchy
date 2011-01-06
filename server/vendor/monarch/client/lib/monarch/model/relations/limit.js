(function(Monarch) {

_.constructor("Monarch.Model.Relations.Limit", Monarch.Model.Relations.Relation, {

  initialize: function(operand, n) {
    this.operand = operand;
    this.n = n;
    this.sortSpecifications = operand.sortSpecifications;
    this.initializeEventsSystem();
  },

  wireRepresentation: function() {
    return {
      type: "limit",
      count: this.n,
      operand: this.operand.wireRepresentation()
    };
  },

  tuples: function() {
    if (this.storedTuples) return this.storedTuples.values();
    return this.operand.tuples().slice(0, this.n);
  },

  isEqual: function(other) {
    if (!other || other.constructor !== this.constructor) return false;
    return other.n === this.n && this.operand.isEqual(other.operand);
  },
  
  onOperandInsert: function(tuple, index, newKey, oldKey) {
    if (index < this.n) {
      var formerLastTuple = this.at(this.n - 1);
      if (formerLastTuple) this.tupleRemovedRemotely(formerLastTuple);
      this.tupleInsertedRemotely(tuple, newKey, oldKey);
    }
  },

  onOperandUpdate: function(tuple, changeset, newIndex, oldIndex, newKey, oldKey) {
    if (oldIndex < this.n) {
      if (newIndex >= this.n) {
        this.tupleRemovedRemotely(tuple, newKey, oldKey);
        var newLastTuple = this.operand.at(this.n - 1);
        if (newLastTuple) this.tupleInsertedRemotely(newLastTuple);
      } else {
        this.tupleUpdatedRemotely(tuple, changeset, newKey, oldKey);
      }
    } else {
      if (newIndex < this.n) {
        this.tupleRemovedRemotely(this.at(this.n - 1));
        this.tupleInsertedRemotely(tuple, newKey, oldKey);
     } else {
      }
    }
  },

  onOperandRemove: function(tuple, index, newKey, oldKey) {
    if (index < this.n) {
      this.tupleRemovedRemotely(tuple, newKey, oldKey);
      var newLastTuple = this.operand.at(this.n - 1);
      if (newLastTuple) this.tupleInsertedRemotely(newLastTuple);
    }
  }


});

})(Monarch);