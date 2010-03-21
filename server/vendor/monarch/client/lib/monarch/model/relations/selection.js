(function(Monarch) {

_.constructor("Monarch.Model.Relations.Selection", Monarch.Model.Relations.Relation, {

  initialize: function(operand, predicate) {
    this.operand = operand;
    this.predicate = predicate;
    this.initializeEventsSystem();
  },

  allTuples: function() {
    if (this.Tuples) return this.Tuples;
    return _.filter(this.operand.allTuples(), function(tuple) {
      return this.predicate.evaluate(tuple);
    }, this);
  },

  create: function(fieldValues) {
    return this.operand.create(this.predicate.forceMatchingFieldValues(fieldValues));
  },

  localCreate: function(fieldValues) {
    return this.operand.localCreate(this.predicate.forceMatchingFieldValues(fieldValues));
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

  // private

  subscribeToOperands: function() {
    this.operandsSubscriptionBundle.add(this.operand.onRemoteInsert(function(record) {
      if (this.predicate.evaluate(record)) this.tupleInsertedRemotely(record);
    }, this));

    this.operandsSubscriptionBundle.add(this.operand.onRemoteRemove(function(record) {
      if (this.predicate.evaluate(record)) this.tupleRemovedRemotely(record);
    }, this));

    this.operandsSubscriptionBundle.add(this.operand.onRemoteUpdate(function(record, changedFields) {
      if (this.contains(record)) {
        if (this.predicate.evaluate(record)) {
          this.tupleUpdatedRemotely(record, changedFields);
        } else {
          this.tupleRemovedRemotely(record);
        }
      } else {
        if (this.predicate.evaluate(record)) this.tupleInsertedRemotely(record);
      }
    }, this));

    this.operandsSubscriptionBundle.add(this.operand.onDirty(function(record) {
      if (this.contains(record)) this.recordMadeDirty(record);
    }, this));

    this.operandsSubscriptionBundle.add(this.operand.onClean(function(record) {
      if (this.contains(record)) this.recordMadeClean(record);
    }, this));
  }
});

})(Monarch);
