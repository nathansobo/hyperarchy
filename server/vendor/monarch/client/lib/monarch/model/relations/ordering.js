(function(Monarch) {

Monarch.constructor("Monarch.Model.Relations.Ordering", Monarch.Model.Relations.Relation, {
  constructorInitialize: function() {
    this.delegate('create', 'localCreate', 'createFromRemote', 'operand');
  },

  initialize: function(operand, orderByColumns) {
    this.operand = operand;
    this.orderByColumns = orderByColumns;

    var self = this;
    this.comparator = function(a, b) {
      for(var i = 0; i < self.orderByColumns.length; i++) {
        var orderByColumn = self.orderByColumns[i]
        var column = orderByColumn.column;
        var directionCoefficient = orderByColumn.directionCoefficient;

        var aValue = a.field(column).value();
        var bValue = b.field(column).value();

        if (aValue < bValue) return -1 * directionCoefficient;
        else if (aValue > bValue) return 1 * directionCoefficient;
      }
      return 0;
    }
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
    var self = this;
    this.operandsSubscriptionBundle.add(this.operand.onRemoteInsert(function(record) {
      self.tupleInsertedRemotely(record);
    }));

    this.operandsSubscriptionBundle.add(this.operand.onRemoteRemove(function(record) {
      self.tupleRemovedRemotely(record);
    }));

    this.operandsSubscriptionBundle.add(this.operand.onRemoteUpdate(function(record, changedFields) {
      self.tupleUpdatedRemotely(record, changedFields);
    }));

    this.operandsSubscriptionBundle.add(this.operand.onDirty(function(record) {
      self.recordMadeDirty(record);
    }));

    this.operandsSubscriptionBundle.add(this.operand.onClean(function(record) {
      self.recordMadeClean(record);
    }));
  }
})

})(Monarch);
