(function(Monarch) {

Monarch.constructor("Monarch.Model.Relations.Difference", Monarch.Model.Relations.Relation, {
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
  },

  memoizeTuples: function() {
    var tuplesById = {};
    this.each(function(record) {
      tuplesById[record.id()] = record;
    }.bind(this));
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
