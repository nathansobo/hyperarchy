(function(Monarch) {

_.constructor("Monarch.Model.Relations.Difference", Monarch.Model.Relations.Relation, {
  initialize: function(leftOperand, rightOperand) {
    this.leftOperand = leftOperand;
    this.rightOperand = rightOperand;
    this.initializeEventsSystem();
  },

  contains: function(record) {
    return record.id() in this.tuplesById;
  },

  allTuples: function() {
    if (this.tuplesById) return _.values(this.tuplesById);
    var tuples = [];

    var leftTuples = this.leftOperand.allTuples().sort(function(a, b) {
      if (a.id() < b.id()) return -1;
      if (a.id() > b.id()) return 1;
      return 0;
    });

    var rightTuples = this.rightOperand.allTuples().sort(function(a, b) {
      if (a.id() < b.id()) return -1;
      if (a.id() > b.id()) return 1;
      return 0;
    });

    var rightIndex = 0;

    _.each(leftTuples, function(leftRecord, index) {
      if (rightTuples[rightIndex] && leftRecord.id() === rightTuples[rightIndex].id()) {
        rightIndex++;
      } else {
        tuples.push(leftRecord);
      }
    });

    return tuples;
  },

  column: function(name) {
    return this.leftOperand.column(name);
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
  },

  unsubscribeFromOperands: function($super) {
    $super();
    this.tuplesById = null;
  },

  memoizeTuples: function() {
    var tuplesById = {};
    this.each(function(record) {
      tuplesById[record.id()] = record;
    }, this);
    this.tuplesById = tuplesById;
  },

  tupleInsertedRemotely: function(record, options) {
    this.tuplesById[record.id()] = record;
    this.onRemoteInsertNode.publish(record);
  },

  tupleUpdatedRemotely: function(record, updateData) {
    this.onRemoteUpdateNode.publish(record, updateData);
  },

  tupleRemovedRemotely: function(record) {
    delete this.tuplesById[record.id()];
    this.onRemoteRemoveNode.publish(record);
  }
});

})(Monarch);
