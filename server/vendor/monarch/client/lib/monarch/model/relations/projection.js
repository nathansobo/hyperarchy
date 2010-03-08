(function(Monarch) {

Monarch.constructor("Monarch.Model.Relations.Projection", Monarch.Model.Relations.Relation, {
  initialize: function(operand, projectedColumns) {
    var self = this;
    this.operand = operand;
    this.projectedColumnsByName = {};
    _.each(projectedColumns, function(projectedColumn) {
      self.projectedColumnsByName[projectedColumn.name()] = projectedColumn;
    });

    this.tupleConstructor = Monarch.ModuleSystem.constructor(Monarch.Model.Tuple);
    this.tupleConstructor.projectedColumnsByName = this.projectedColumnsByName;
    this.tupleConstructor.initializeFieldReaders();

    this.initializeEventsSystem();
  },

  allTuples: function() {
    if (this.Tuples) return this.Tuples;

    this.tuplesByOperandRecordId = {};
    return _.map(this.operand.allTuples(), function(operandTuple) {
      return this.tuplesByOperandRecordId[operandTuple.id()] = new this.tupleConstructor(operandTuple);
    }.bind(this));
  },

  column: function(name) {
    return this.projectedColumnsByName[name];
  },

  surfaceTables: function() {
    throw new Error("Projections do not have surface tables");
  },
  
  // private

  subscribeToOperands: function() {
    var self = this;
    this.operandsSubscriptionBundle.add(this.operand.onRemoteInsert(function(operandRecord) {
      var record = new self.tupleConstructor(operandRecord);
      self.tuplesByOperandRecordId[operandRecord.id()] = record;
      self.tupleInsertedRemotely(record);
    }));
    this.operandsSubscriptionBundle.add(this.operand.onRemoteUpdate(function(operandRecord, operandChanges) {
      var changes = self.translateUpdateChanges(operandChanges);
      if (Monarch.Util.isEmpty(changes)) return;
      self.tupleUpdatedRemotely(self.tuplesByOperandRecordId[operandRecord.id()], changes);
    }));
    this.operandsSubscriptionBundle.add(this.operand.onRemoteRemove(function(operandRecord) {
      self.tupleRemovedRemotely(self.tuplesByOperandRecordId[operandRecord.id()]);
    }));
  },

  translateUpdateChanges: function(changes) {
    var self = this;
    var translatedChanges = {};
    _.each(changes, function(operandColumnChanges) {
      var projectedColumn = self.projectedColumnFromOperandColumn(operandColumnChanges.column);
      if (projectedColumn) {
        translatedChanges[projectedColumn.name()] = {
          column: projectedColumn,
          oldValue: operandColumnChanges.oldValue,
          newValue: operandColumnChanges.newValue
        }
      }
    });
    return translatedChanges;
  },

  projectedColumnFromOperandColumn: function(operandColumn) {
    return Monarch.Util.detect(this.projectedColumnsByName, function(name, projectedColumn) {
      return projectedColumn.column === operandColumn;
    });
  }
});

})(Monarch);
