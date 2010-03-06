(function(Monarch) {

Monarch.constructor("Monarch.Model.Relations.Union", Monarch.Model.Relations.Relation, {
  initialize: function(leftOperand, rightOperand) {
    this.leftOperand = leftOperand;
    this.rightOperand = rightOperand;
    this.initializeEventsSystem();
  },

  contains: function(record) {
    return record.id() in this.tuplesById;
  },

  allTuples: function() {
    if (this.Tuples) return this.Tuples;

    var tuplesByHashCode = {};

    _.each(this.leftOperand.allTuples(), function(tuple) {
      tuplesByHashCode[tuple.hashCode()] = tuple;
    });
    _.each(this.rightOperand.allTuples(), function(tuple) {
      tuplesByHashCode[tuple.hashCode()] = tuple;
    });
    return _.values(tuplesByHashCode);
  },

  surfaceTables: function() {
    return this.leftOperand.surfaceTables();
  },
  
  // private

  subscribeToOperands: function() {
    var self = this;
    this.operandsSubscriptionBundle.add(this.leftOperand.onRemoteInsert(function(record) {
      if (!self.rightOperand.find(record.id())) self.tupleInsertedRemotely(record);
    }));

    this.operandsSubscriptionBundle.add(this.leftOperand.onRemoteUpdate(function(record, changes) {
      if (self.contains(record)) self.tupleUpdatedRemotely(record, changes);
    }));

    this.operandsSubscriptionBundle.add(this.leftOperand.onRemoteRemove(function(record) {
      if (self.contains(record)) self.tupleRemovedRemotely(record);
    }));

    this.operandsSubscriptionBundle.add(this.rightOperand.onRemoteInsert(function(record) {
      if (self.contains(record)) self.tupleRemovedRemotely(record);
    }));

    this.operandsSubscriptionBundle.add(this.rightOperand.onRemoteRemove(function(record) {
      if (self.leftOperand.find(record.id())) self.tupleInsertedRemotely(record);
    }));
  }
});

})(Monarch);
