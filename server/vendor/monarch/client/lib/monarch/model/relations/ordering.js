(function(Monarch) {

_.constructor("Monarch.Model.Relations.Ordering", Monarch.Model.Relations.Relation, {
  constructorInitialize: function() {
    this.delegate('create', 'localCreate', 'createFromRemote', 'operand');
  },

  initialize: function(operand, sortSpecifications) {
    this.operand = operand;
    this.sortSpecifications = sortSpecifications;

    this.comparator = _.bind(function(a, b) {
      for(var i = 0; i < this.sortSpecifications.length; i++) {
        var sortSpecification = this.sortSpecifications[i]
        var column = sortSpecification.column;
        var directionCoefficient = sortSpecification.directionCoefficient;

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
    return new Monarch.Model.Relations.Ordering(this.operand.evaluateInRepository(repository), this.sortSpecifications);
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

  tupleInsertedRemotely: function(tuple) {
    var position = _.comparatorSortedIndex(this._tuples, tuple, this.comparator);
    this._tuples.splice(position, 0, tuple);
    this.onRemoteInsertNode.publish(tuple, position);
  },

  tupleUpdatedRemotely: function($super, tuple, changedFields) {
    var currentPosition = _.indexOf(this._tuples, tuple);
    var positionMayChange = _.any(changedFields, function(changedField) {
      return this.sortingOnColumn(changedField.column);
    }, this);
    if (!positionMayChange) $super(tuple, changedFields, currentPosition, currentPosition);

    var newPosition = _.comparatorSortedIndex(this._tuples, tuple, this.comparator);
    this._tuples.splice(currentPosition, 1);
    this._tuples.splice(newPosition, 0, tuple);
    $super(tuple, changedFields, newPosition, currentPosition);
  },

  tupleRemovedRemotely: function(record) {
    var position = _.indexOf(this._tuples, record);
    this._tuples.splice(position, 1);
    this.onRemoteRemoveNode.publish(record, position);
  },

  sortingOnColumn: function(column) {
    return _.detect(this.sortSpecifications, function(sortSpecification) {
      return sortSpecification.column === column;
    });
  },

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
