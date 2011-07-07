(function(Monarch) {

_.constructor("Monarch.Model.Relations.TableProjection", Monarch.Model.Relations.Relation, {
  constructorInitialize: function() {
    this.delegate('column', 'projectedTable');
  },

  initialize: function(operand, projectedTable) {
    this.operand = operand;
    this.projectedTable = projectedTable;
    this.sortSpecifications = this.projectOperandSortSpecifications();
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

  onOperandInsert: function(compositeTuple, index, newKey, oldKey) {
    if (this.findByKey(oldKey)) return;
    this.tupleInsertedRemotely(compositeTuple.record(this.projectedTable), this.projectSortKey(newKey), this.projectSortKey(oldKey));
  },

  onOperandUpdate: function(compositeTuple, changeset, newIndex, oldIndex, newKey, oldKey) {
    if (this.lastChangeset === changeset) return;
    if (!this.changesetPertainsToProjectedTable(changeset)) return;
    this.lastChangeset = changeset;
    this.tupleUpdatedRemotely(compositeTuple.record(this.projectedTable), changeset, this.projectSortKey(newKey), this.projectSortKey(oldKey));
  },

  onOperandRemove: function(compositeTuple, index, newKey, oldKey) {
    var tuple = compositeTuple.record(this.projectedTable);
    var idColumn = this.projectedTable.column('id');
    if (this.operand.find(idColumn.eq(tuple.id()))) return;
    this.tupleRemovedRemotely(tuple, this.projectSortKey(newKey), this.projectSortKey(oldKey));
  },

  changesetPertainsToProjectedTable: function(changeset) {
    return _.detect(changeset, function(change) {
      return change.column.table === this.projectedTable;
    }, this);
  },

  projectOperandSortSpecifications: function() {
    return _.filter(this.operand.sortSpecifications, function(sortSpec) {
      return sortSpec.column.table === this.projectedTable;
    }, this);
  },

  projectSortKey: function(sortKey) {
    var projectedSortKey = {};
    _.each(sortKey, function(value, key) {
      if (this.projectedTable.globalName === key.split(".")[0]) {
        projectedSortKey[key] = value;
      }
    }, this);
    return projectedSortKey;
  }
});

})(Monarch);
