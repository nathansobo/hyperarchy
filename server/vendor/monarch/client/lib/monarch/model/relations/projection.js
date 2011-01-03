(function(Monarch) {

_.constructor("Monarch.Model.Relations.Projection", Monarch.Model.Relations.Relation, {
  initialize: function(operand, projectedColumns) {
    this.operand = operand;
    this.projectedColumnsByName = {};
    _.each(projectedColumns, function(projectedColumn) {
      this.projectedColumnsByName[projectedColumn.name()] = projectedColumn;
    }, this);

    this.sortSpecifications = this.projectSortSpecifications(projectedColumns, operand.sortSpecifications);
    this.tupleConstructor = _.constructor(Monarch.Model.Tuple);
    this.tupleConstructor.projectedColumnsByName = this.projectedColumnsByName;
    this.tupleConstructor.initializeFieldReaders();

    this.initializeEventsSystem();
  },

  projectSortSpecifications: function(projectedColumns, sortSpecifications) {
    var projectedSortSpecifications = [];

    _.each(sortSpecifications, function(sortSpec) {
      var projectedColumn = _.detect(projectedColumns, function(projectedColumn) {
        return projectedColumn.column === sortSpec.column;
      });

      if (projectedColumn) {
        projectedSortSpecifications.push(new Monarch.Model.SortSpecification(projectedColumn, sortSpec.direction));
      }
    });

    return projectedSortSpecifications;
  },

  tuples: function() {
    if (this.storedTuples) return this.storedTuples.values();

    this.tuplesByOperandRecordId = {};
    return _.map(this.operand.tuples(), function(operandTuple) {
      return this.tuplesByOperandRecordId[operandTuple.id()] = new this.tupleConstructor(operandTuple);
    }, this);
  },

  column: function(name) {
    return this.projectedColumnsByName[name];
  },

  surfaceTables: function() {
    throw new Error("Projections do not have surface tables");
  },
  
  // private

  subscribeToOperands: function() {
    this.operandsSubscriptionBundle.add(this.operand.onInsert(function(operandRecord) {
      var record = new this.tupleConstructor(operandRecord);
      this.tuplesByOperandRecordId[operandRecord.id()] = record;
      this.tupleInsertedRemotely(record);
    }, this));
    this.operandsSubscriptionBundle.add(this.operand.onUpdate(function(operandRecord, operandChanges) {
      var changes = this.translateUpdateChanges(operandChanges);
      if (_.isEmpty(changes)) return;
      this.tupleUpdatedRemotely(this.tuplesByOperandRecordId[operandRecord.id()], changes);
    }, this));
    this.operandsSubscriptionBundle.add(this.operand.onRemove(function(operandRecord) {
      this.tupleRemovedRemotely(this.tuplesByOperandRecordId[operandRecord.id()]);
    }, this));
  },

  translateUpdateChanges: function(changes) {
    var translatedChanges = {};
    _.each(changes, function(operandColumnChanges) {
      var projectedColumn = this.projectedColumnFromOperandColumn(operandColumnChanges.column);
      if (projectedColumn) {
        translatedChanges[projectedColumn.name()] = {
          column: projectedColumn,
          oldValue: operandColumnChanges.oldValue,
          newValue: operandColumnChanges.newValue
        }
      }
    }, this);
    return translatedChanges;
  },

  projectedColumnFromOperandColumn: function(operandColumn) {
    return _.detect(this.projectedColumnsByName, function(projectedColumn) {
      return projectedColumn.column === operandColumn;
    });
  }
});

})(Monarch);
