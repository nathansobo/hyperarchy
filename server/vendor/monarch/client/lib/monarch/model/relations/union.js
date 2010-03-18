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
    this.operandsSubscriptionBundle.add(this.leftOperand.onRemoteInsert(function(record) {
      if (!this.rightOperand.find(record.id())) this.tupleInsertedRemotely(record);
    }, this));

    this.operandsSubscriptionBundle.add(this.leftOperand.onRemoteUpdate(function(record, changes) {
      if (this.contains(record)) this.tupleUpdatedRemotely(record, changes);
    }, this));

    this.operandsSubscriptionBundle.add(this.leftOperand.onRemoteRemove(function(record) {
      if (this.contains(record)) this.tupleRemovedRemotely(record);
    }, this));

    this.operandsSubscriptionBundle.add(this.rightOperand.onRemoteInsert(function(record) {
      if (this.contains(record)) this.tupleRemovedRemotely(record);
    }, this));

    this.operandsSubscriptionBundle.add(this.rightOperand.onRemoteRemove(function(record) {
      if (this.leftOperand.find(record.id())) this.tupleInsertedRemotely(record);
    }, this));
  }
});

})(Monarch);
