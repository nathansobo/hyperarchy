(function(Monarch) {

_.constructor("Monarch.Model.Relations.TableProjection", Monarch.Model.Relations.Relation, {
  constructorInitialize: function() {
    this.delegate('column', 'projectedTable');
  },

  initialize: function(operand, projectedTable) {
    this.operand = operand;
    this.projectedTable = projectedTable;
    this.sortSpecifications = projectedTable.sortSpecifications; // this should actually be based on the operand, but we have to remove columns projected away
    this.initializeEventsSystem();
  },

  tuples: function() {
    if (this.storedTuples) return this.storedTuples.values();

    var tuples = [];
    _.each(this.operand.tuples(), function(compositeTuple) {
      var record = compositeTuple.record(this.projectedTable);
      if (!_.include(tuples, record)) tuples.push(record);
    }, this);
    return tuples;
  },

  surfaceTables: function() {
    return [this.projectedTable];
  },

  wireRepresentation: function() {
    return {
      type: "table_projection",
      operand: this.operand.wireRepresentation(),
      projected_table: this.projectedTable.globalName
    }
  },

  // private

  subscribeToOperands: function() {
    this.operandsSubscriptionBundle.add(this.operand.onInsert(function(compositeTuple) {
      var tuple = compositeTuple.record(this.projectedTable);
      if (!this.contains(tuple)) this.tupleInsertedRemotely(tuple);
    }, this));

    this.operandsSubscriptionBundle.add(this.operand.onUpdate(function(compositeTuple, changeset) {
      var updatedColumnInProjectedTable = _.detect(changeset, function(change) {
        return change.column.table == this.projectedTable;
      }, this);
      var record = compositeTuple.record(this.projectedTable);

      if (updatedColumnInProjectedTable && !this.duplicatesLastUpdateEvent(record, changeset)) {
        this.lastUpdateEvent = [record, changeset];
        this.tupleUpdatedRemotely(record, changeset);
      }
    }, this));

    this.operandsSubscriptionBundle.add(this.operand.onRemove(function(compositeTuple) {
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
