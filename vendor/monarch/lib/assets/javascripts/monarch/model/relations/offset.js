(function(Monarch) {

_.constructor("Monarch.Model.Relations.Offset", Monarch.Model.Relations.Relation, {
  initialize: function(operand, count) {
    this.operand = operand;
    this.count = count;
    this.sortSpecifications = operand.sortSpecifications;
    this.initializeEventsSystem();
  },

  tuples: function() {
    if (this.storedTuples) return this.storedTuples.values();
    return this.operand.tuples().slice(this.count);
  },

  wireRepresentation: function() {
    return {
      type: "offset",
      operand: this.operand.wireRepresentation(),
      count: this.count
    };
  },

  isEqual: function(other) {
    if (!other || other.constructor !== this.constructor) return false;
    return other.count === this.count && this.operand.isEqual(other.operand);
  },

  // private

  onOperandInsert: function(tuple, index, newKey, oldKey) {
    if (index < this.count) {
      var nthTuple = this.operand.at(this.count);
      if (nthTuple) this.tupleInsertedRemotely(nthTuple);
    } else {
      this.tupleInsertedRemotely(tuple, newKey, oldKey);
    }
  },

  onOperandUpdate: function(tuple, changeset, newIndex, oldIndex, newKey, oldKey) {
    if (oldIndex < this.count) {
      if (newIndex >= this.count) {
        this.tupleRemovedRemotely(this.at(0));
        this.tupleInsertedRemotely(tuple, newKey, oldKey);
      }
    } else {
      if (newIndex < this.count) {
        this.tupleRemovedRemotely(tuple, newKey, oldKey);
        this.tupleInsertedRemotely(this.operand.at(this.count));
      } else {
        this.tupleUpdatedRemotely(tuple, changeset, newKey, oldKey)
      }
    }
  },

  onOperandRemove: function(tuple, index, newKey, oldKey) {
    if (index < this.count) {
      var formerNthTuple = this.at(0);
      if (formerNthTuple) this.tupleRemovedRemotely(formerNthTuple);
    } else {
      this.tupleRemovedRemotely(tuple, newKey, oldKey);
    }
  }
});

})(Monarch);