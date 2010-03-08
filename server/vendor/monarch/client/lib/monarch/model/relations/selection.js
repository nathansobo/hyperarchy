(function(Monarch) {

Monarch.constructor("Monarch.Model.Relations.Selection", Monarch.Model.Relations.Relation, {

  initialize: function(operand, predicate) {
    this.operand = operand;
    this.predicate = predicate;
    this.initializeEventsSystem();
  },

  allTuples: function() {
    if (this.Tuples) return this.Tuples;
    return _.filter(this.operand.allTuples(), function(tuple) {
      return this.predicate.evaluate(tuple);
    }.bind(this));
  },

  create: function(fieldValues) {
    return this.operand.create(this.predicate.forceMatchingFieldValues(fieldValues));
  },

  localCreate: function(fieldValues) {
    return this.operand.localCreate(this.predicate.forceMatchingFieldValues(fieldValues));
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
    var self = this;

    this.operandsSubscriptionBundle.add(this.operand.onRemoteInsert(function(record) {
      if (self.predicate.evaluate(record)) self.tupleInsertedRemotely(record);
    }));

    this.operandsSubscriptionBundle.add(this.operand.onRemoteRemove(function(record) {
      if (self.predicate.evaluate(record)) self.tupleRemovedRemotely(record);
    }));

    this.operandsSubscriptionBundle.add(this.operand.onRemoteUpdate(function(record, changedFields) {
      if (self.contains(record)) {
        if (self.predicate.evaluate(record)) {
          self.tupleUpdatedRemotely(record, changedFields);
        } else {
          self.tupleRemovedRemotely(record);
        }
      } else {
        if (self.predicate.evaluate(record)) self.tupleInsertedRemotely(record);
      }
    }));

    this.operandsSubscriptionBundle.add(this.operand.onDirty(function(record) {
      if (self.contains(record)) self.recordMadeDirty(record);
    }));

    this.operandsSubscriptionBundle.add(this.operand.onClean(function(record) {
      if (self.contains(record)) self.recordMadeClean(record);
    }));
  }
});

})(Monarch);
