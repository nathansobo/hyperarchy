(function(Monarch) {

Monarch.constructor("Monarch.Model.Relations.TableProjection", Monarch.Model.Relations.Relation, {
  initialize: function(operand, projectedTable) {
    this.operand = operand;
    this.projectedTable = projectedTable;
    this.initializeEventsSystem();
  },

  hasOperands: true,

  allTuples: function() {
    if (this.Tuples) return this.Tuples;

    var allTuples = [];
    _.each(this.operand.allTuples(), function(compositeTuple) {
      var record = compositeTuple.record(this.projectedTable);
      if (!Monarch.Util.contains(allTuples, record)) allTuples.push(record);
    }.bind(this));
    return allTuples;
  },

  surfaceTables: function() {
    return [this.projectedTable];
  },

  // private

  subscribeToOperands: function() {
    var self = this;
    this.operandsSubscriptionBundle.add(this.operand.onRemoteInsert(function(compositeTuple) {
      var tuple = compositeTuple.record(self.projectedTable);
      if (!self.contains(tuple)) self.tupleInsertedRemotely(tuple);
    }));

    this.operandsSubscriptionBundle.add(this.operand.onRemoteUpdate(function(compositeTuple, changeset) {
      var updatedColumnInProjectedTable = _.detect(changeset, function(change) {
        return change.column.table == self.projectedTable;
      });
      var record = compositeTuple.record(self.projectedTable);

      if (updatedColumnInProjectedTable && !self.duplicatesLastUpdateEvent(record, changeset)) {
        self.lastUpdateEvent = [record, changeset];
        self.tupleUpdatedRemotely(record, changeset);
      }
    }));

    this.operandsSubscriptionBundle.add(this.operand.onRemoteRemove(function(compositeTuple) {
      var tuple = compositeTuple.record(self.projectedTable);
      if (!self.operand.find(self.projectedTable.column('id').eq(tuple.id()))) {
        self.tupleRemovedRemotely(tuple);
      }
    }));
  },

  duplicatesLastUpdateEvent: function(record, changeset) {
    if (!this.lastUpdateEvent) return false;
    var lastRecord = this.lastUpdateEvent[0];
    var lastChangset = this.lastUpdateEvent[1];
    if (lastRecord !== record) return false;
    if (!_(lastChangset).isEqual(changeset)) return false;
    return true;
  }
});

})(Monarch);
