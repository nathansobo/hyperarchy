(function(Monarch) {

_.constructor("Monarch.Model.Relations.Ordering", Monarch.Model.Relations.Relation, {
  constructorInitialize: function() {
    this.delegate('create', 'localCreate', 'createFromRemote', 'operand');
  },

  initialize: function(operand, orderByColumns) {
    this.operand = operand;
    this.orderByColumns = orderByColumns;

    this.comparator = _.bind(function(a, b) {
      for(var i = 0; i < this.orderByColumns.length; i++) {
        var orderByColumn = this.orderByColumns[i]
        var column = orderByColumn.column;
        var directionCoefficient = orderByColumn.directionCoefficient;

        var aValue = a.field(column).value();
        var bValue = b.field(column).value();

        if (aValue < bValue) return -1 * directionCoefficient;
        else if (aValue > bValue) return 1 * directionCoefficient;
      }
      return 0;
    }, this);
    this.initializeEventsSystem();
  },

  allTuples: function() {
    return this.operand.allTuples().sort(this.comparator);
  },

  evaluateInRepository: function(repository) {
    return new Monarch.Model.Relations.Ordering(this.operand.evaluateInRepository(repository), this.orderByColumns);
  },

  primaryTable: function() {
    return this.operand.primaryTable();
  },

  wireRepresentation: function() {
    return this.operand.wireRepresentation();
  },

  surfaceTables: function() {
    return this.operand.surfaceTables();
  },

  column: function(name) {
    return this.operand.column(name);
  },

  // private

  subscribeToOperands: function() {
    this.operandsSubscriptionBundle.add(this.operand.onRemoteInsert(function(record) {
      this.tupleInsertedRemotely(record);
    }, this));

    this.operandsSubscriptionBundle.add(this.operand.onRemoteRemove(function(record) {
      this.tupleRemovedRemotely(record);
    }, this));

    this.operandsSubscriptionBundle.add(this.operand.onRemoteUpdate(function(record, changedFields) {
      this.tupleUpdatedRemotely(record, changedFields);
    }, this));

    this.operandsSubscriptionBundle.add(this.operand.onDirty(function(record) {
      this.recordMadeDirty(record);
    }, this));

    this.operandsSubscriptionBundle.add(this.operand.onClean(function(record) {
      this.recordMadeClean(record);
    }, this));
  }
})

})(Monarch);
