(function(Monarch) {

_.constructor("Monarch.Model.Relations.Selection", Monarch.Model.Relations.Relation, {

  initialize: function(operand, predicate) {
    this.operand = operand;
    this.predicate = predicate;
    this.sortSpecifications = operand.sortSpecifications;
    this.initializeEventsSystem();
  },

  tuples: function() {
    if (this.storedTuples) {
      return this.storedTuples.values();
    }
    return _.filter(this.operand.tuples(), function(tuple) {
      return this.predicate.evaluate(tuple);
    }, this);
  },

  create: function(fieldValues) {
    return this.operand.create(this.predicate.forceMatchingFieldValues(fieldValues));
  },

  createFromRemote: function(fieldValues) {
    return this.operand.createFromRemote(this.predicate.forceMatchingFieldValues(fieldValues));
  },
  
  createFromRemote: function(fieldValues) {
    return this.operand.createFromRemote(this.predicate.forceMatchingFieldValues(fieldValues));
  },

  wireRepresentation: function() {
    return {
      type: "selection",
      operand: this.operand.wireRepresentation(),
      predicate: this.predicate.wireRepresentation()
    };
  },

  evaluateInRepository: function(repository) {
    return new Monarch.Model.Relations.Selection(this.operand.evaluateInRepository(repository), this.predicate);
  },

  primaryTable: function() {
    return this.operand.primaryTable();
  },

  column: function(name) {
    return this.operand.column(name);
  },

  surfaceTables: function() {
    return this.operand.surfaceTables();
  },

  isEqual: function(other) {
    if (other.constructor !== Monarch.Model.Relations.Selection) return false;
    return this.predicate.isEqual(other.predicate) && this.operand.isEqual(other.operand);
  },

  // private

  onOperandInsert: function(tuple, index, newKey, oldKey) {
    if (this.predicate.evaluate(tuple)) this.tupleInsertedRemotely(tuple, newKey, oldKey);
  },

  onOperandUpdate: function(tuple, changeset, newIndex, oldIndex, newKey, oldKey) {
    if (this.findByKey(oldKey)) {
      if (this.predicate.evaluate(tuple)) {
        this.tupleUpdatedRemotely(tuple, changeset, newKey, oldKey);
      } else {
        this.tupleRemovedRemotely(tuple, newKey, oldKey);
      }
    } else {
      if (this.predicate.evaluate(tuple)) this.tupleInsertedRemotely(tuple, newKey, oldKey);
    }
  }
});

})(Monarch);
