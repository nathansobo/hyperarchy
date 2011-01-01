(function(Monarch) {

_.constructor("Monarch.Model.Relations.Ordering", Monarch.Model.Relations.Relation, {
  constructorInitialize: function() {
    this.delegate('create', 'createFromRemote', 'operand');
  },

  initialize: function(operand, sortSpecifications) {
    this.operand = operand;
    this.sortSpecifications = sortSpecifications;

    this.comparator = _.bind(function(a, b) {
      // null and undefined are treated as infinity
      function lessThan(a, b) {
        if ((a === null || a === undefined) && b !== null && b !== undefined) return false;
        if ((b === null || b === undefined) && a !== null && a !== undefined) return true;
        return a < b;
      }

      for(var i = 0; i < this.sortSpecifications.length; i++) {
        var sortSpecification = this.sortSpecifications[i]
        var column = sortSpecification.column;
        var directionCoefficient = sortSpecification.directionCoefficient;

        var aValue = a.field(column).value();
        var bValue = b.field(column).value();

        if (lessThan(aValue, bValue)) return -1 * directionCoefficient;
        else if (lessThan(bValue, aValue)) return 1 * directionCoefficient;
      }
      return 0;
    }, this);
    this.initializeEventsSystem();
  },

  tuples: function() {
    return this.operand.tuples().sort(this.comparator);
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
    var position = this._tuples.insert(tuple)
    this.onInsertNode.publish(tuple, position);
  },

  tupleUpdatedRemotely: function($super, tuple, changedFields) {
    var positionMayChange = _.any(changedFields, function(changedField) {
      return this.sortingOnColumn(changedField.column);
    }, this);
    if (!positionMayChange) {
      $super(tuple, changedFields, currentPosition, currentPosition);
      return;
    }

    var oldPosition = this._tuples.remove(tuple);
    var newPosition = this._tuples.insert(tuple);
    $super(tuple, changedFields, newPosition, oldPosition);
  },

  tupleRemovedRemotely: function(record) {
    var position = this._tuples.remove(record);
    this.onRemoveNode.publish(record, position);
  },

  sortingOnColumn: function(column) {
    return _.detect(this.sortSpecifications, function(sortSpecification) {
      return sortSpecification.column === column;
    });
  },

  subscribeToOperands: function() {
    this.operandsSubscriptionBundle.add(this.operand.onInsert(function(record) {
      this.tupleInsertedRemotely(record);
    }, this));

    this.operandsSubscriptionBundle.add(this.operand.onRemove(function(record) {
      this.tupleRemovedRemotely(record);
    }, this));

    this.operandsSubscriptionBundle.add(this.operand.onUpdate(function(record, changedFields) {
      this.tupleUpdatedRemotely(record, changedFields);
    }, this));

    this.operandsSubscriptionBundle.add(this.operand.onDirty(this.hitch('recordMadeDirty')));
    this.operandsSubscriptionBundle.add(this.operand.onClean(this.hitch('recordMadeClean')));
    this.operandsSubscriptionBundle.add(this.operand.onInvalid(this.hitch('recordMadeInvalid')));
    this.operandsSubscriptionBundle.add(this.operand.onValid(this.hitch('recordMadeValid')));
  }
})

})(Monarch);
