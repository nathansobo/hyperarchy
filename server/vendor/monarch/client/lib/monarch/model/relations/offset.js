(function(Monarch) {

_.constructor("Monarch.Model.Relations.Offset", Monarch.Model.Relations.Relation, {
  initialize: function(operand, n) {
    this.operand = operand;
    this.n = n;
    this.sortSpecifications = operand.sortSpecifications;
    this.initializeEventsSystem();
  },

  tuples: function() {
    if (this.storedTuples) return this.storedTuples.values();
    return this.operand.tuples().slice(this.n);
  },

  wireRepresentation: function() {
    return {
      type: "offset",
      operand: this.operand.wireRepresentation(),
      n: this.n
    };
  },

  isEqual: function(other) {
    if (!other || other.constructor !== this.constructor) return false;
    return other.n === this.n && this.operand.isEqual(other.operand);
  },

  // private

  onOperandInsert: function(tuple, index, newKey, oldKey) {
    if (index < this.n) {
      var nthTuple = this.operand.at(this.n);
      if (nthTuple) this.tupleInsertedRemotely(nthTuple);
    } else {
      this.tupleInsertedRemotely(tuple, newKey, oldKey);
    }
  },

  onOperandUpdate: function(tuple, changeset, newIndex, oldIndex, newKey, oldKey) {


    if (oldIndex < this.n) {
      if (newIndex >= this.n) {
        this.tupleRemovedRemotely(this.at(0));
        this.tupleInsertedRemotely(tuple, newKey, oldKey);
      }
    } else {
      if (newIndex < this.n) {
        this.tupleRemovedRemotely(tuple, newKey, oldKey);
        this.tupleInsertedRemotely(this.operand.at(this.n));
      } else {
        this.tupleUpdatedRemotely(tuple, changeset, newKey, oldKey)
      }
    }
  },

  onOperandRemove: function(tuple, index, newKey, oldKey) {
    if (index < this.n) {
      var formerNthTuple = this.at(0);
      if (formerNthTuple) this.tupleRemovedRemotely(formerNthTuple);
    } else {
      this.tupleRemovedRemotely(tuple, newKey, oldKey);
    }
  }
});

})(Monarch);