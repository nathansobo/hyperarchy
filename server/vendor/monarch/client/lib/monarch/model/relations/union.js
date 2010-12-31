(function(Monarch) {

_.constructor("Monarch.Model.Relations.Union", Monarch.Model.Relations.Relation, {
  initialize: function(leftOperand, rightOperand) {
    this.leftOperand = leftOperand;
    this.rightOperand = rightOperand;
    this.initializeEventsSystem();
  },

  tuples: function() {
    if (this._tuples) return this._tuples;

    var tuplesByHashCode = {};

    _.each(this.leftOperand.tuples(), function(tuple) {
      tuplesByHashCode[tuple.hashCode()] = tuple;
    });
    _.each(this.rightOperand.tuples(), function(tuple) {
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
      if (!this.rightOperand.contains(record)) this.tupleInsertedRemotely(record);
    }, this));

    this.operandsSubscriptionBundle.add(this.rightOperand.onRemoteInsert(function(record) {
      if (!this.leftOperand.contains(record)) this.tupleInsertedRemotely(record);
    }, this));

    this.operandsSubscriptionBundle.add(this.leftOperand.onRemoteUpdate(function(record, changes) {
      if (this.contains(record)) this.tupleUpdatedRemotely(record, changes);
    }, this));

    this.operandsSubscriptionBundle.add(this.rightOperand.onRemoteUpdate(function(record, changes) {
      if (this.contains(record)) this.tupleUpdatedRemotely(record, changes);
    }, this));

    this.operandsSubscriptionBundle.add(this.leftOperand.onRemoteRemove(function(record) {
      if (!this.rightOperand.contains(record)) this.tupleRemovedRemotely(record);
    }, this));

    this.operandsSubscriptionBundle.add(this.rightOperand.onRemoteRemove(function(record) {
      if (!this.leftOperand.contains(record)) this.tupleRemovedRemotely(record);
    }, this));
  },

  tupleUpdatedRemotely: function($super, record, changes) {
    if (this.lastChanges == changes) return;
    this.lastChanges = changes;
    $super(record, changes);
  }

});

})(Monarch);
