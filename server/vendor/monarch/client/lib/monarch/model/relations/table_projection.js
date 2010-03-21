(function(Monarch) {

_.constructor("Monarch.Model.Relations.TableProjection", Monarch.Model.Relations.Relation, {
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
      if (!_.include(allTuples, record)) allTuples.push(record);
    }, this);
    return allTuples;
  },

  surfaceTables: function() {
    return [this.projectedTable];
  },

  // private

  subscribeToOperands: function() {
    this.operandsSubscriptionBundle.add(this.operand.onRemoteInsert(function(compositeTuple) {
      var tuple = compositeTuple.record(this.projectedTable);
      if (!this.contains(tuple)) this.tupleInsertedRemotely(tuple);
    }, this));

    this.operandsSubscriptionBundle.add(this.operand.onRemoteUpdate(function(compositeTuple, changeset) {
      var updatedColumnInProjectedTable = _.detect(changeset, function(change) {
        return change.column.table == this.projectedTable;
      }, this);
      var record = compositeTuple.record(this.projectedTable);

      if (updatedColumnInProjectedTable && !this.duplicatesLastUpdateEvent(record, changeset)) {
        this.lastUpdateEvent = [record, changeset];
        this.tupleUpdatedRemotely(record, changeset);
      }
    }, this));

    this.operandsSubscriptionBundle.add(this.operand.onRemoteRemove(function(compositeTuple) {
      var tuple = compositeTuple.record(this.projectedTable);
      if (!this.operand.find(this.projectedTable.column('id').eq(tuple.id()))) {
        this.tupleRemovedRemotely(tuple);
      }
    }, this));
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
