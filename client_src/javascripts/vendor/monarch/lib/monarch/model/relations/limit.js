(function(Monarch) {

_.constructor("Monarch.Model.Relations.Limit", Monarch.Model.Relations.Relation, {

  initialize: function(operand, count) {
    this.operand = operand;
    this.count = count;
    this.sortSpecifications = operand.sortSpecifications;
    this.initializeEventsSystem();
  },

  wireRepresentation: function() {
    return {
      type: "limit",
      count: this.count,
      operand: this.operand.wireRepresentation()
    };
  },

  tuples: function() {
    if (this.storedTuples) return this.storedTuples.values();
    return this.operand.tuples().slice(0, this.count);
  },

  isEqual: function(other) {
    if (!other || other.constructor !== this.constructor) return false;
    return other.count === this.count && this.operand.isEqual(other.operand);
  },
  
  onOperandInsert: function(tuple, index, newKey, oldKey) {
    if (index < this.count) {
      var formerLastTuple = this.at(this.count - 1);
      if (formerLastTuple) this.tupleRemovedRemotely(formerLastTuple);
      this.tupleInsertedRemotely(tuple, newKey, oldKey);
    }
  },

  onOperandUpdate: function(tuple, changeset, newIndex, oldIndex, newKey, oldKey) {
    if (oldIndex < this.count) {
      if (newIndex >= this.count) {
        this.tupleRemovedRemotely(tuple, newKey, oldKey);
        var newLastTuple = this.operand.at(this.count - 1);
        if (newLastTuple) this.tupleInsertedRemotely(newLastTuple);
      } else {
        this.tupleUpdatedRemotely(tuple, changeset, newKey, oldKey);
      }
    } else {
      if (newIndex < this.count) {
        this.tupleRemovedRemotely(this.at(this.count - 1));
        this.tupleInsertedRemotely(tuple, newKey, oldKey);
     } else {
      }
    }
  },

  onOperandRemove: function(tuple, index, newKey, oldKey) {
    if (index < this.count) {
      this.tupleRemovedRemotely(tuple, newKey, oldKey);
      var newLastTuple = this.operand.at(this.count - 1);
      if (newLastTuple) this.tupleInsertedRemotely(newLastTuple);
    }
  }


});

})(Monarch);