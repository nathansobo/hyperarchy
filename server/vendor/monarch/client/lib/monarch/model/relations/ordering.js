(function(Monarch) {

_.constructor("Monarch.Model.Relations.Ordering", Monarch.Model.Relations.Relation, {
  constructorInitialize: function() {
    this.delegate('create', 'createFromRemote', 'operand');
  },

  initialize: function(operand, sortSpecifications) {
    this.operand = operand;
    this.sortSpecifications = sortSpecifications.concat(operand.sortSpecifications);
    this.initializeEventsSystem();
  },

  tuples: function() {
    if (!this.comparator) this.comparator = this.buildComparator();
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
    var position = this.storedTuples.insert(this.buildSortKey(tuple), tuple);
    this.onInsertNode.publish(tuple, position);
  },

  tupleUpdatedRemotely: function($super, tuple, changeset) {
    var positionMayChange = _.any(changeset, function(changedField) {
      return this.sortingOnColumn(changedField.column);
    }, this);

    if (!positionMayChange) {
      var currentPosition = this.storedTuples.indexOf(tuple);
      $super(tuple, changeset, currentPosition, currentPosition);
      return;
    }

    var oldPosition = this.storedTuples.remove(this.buildSortKey(tuple, changeset));
    var newPosition = this.storedTuples.insert(this.buildSortKey(tuple), tuple);
    $super(tuple, changeset, newPosition, oldPosition);
  },

  tupleRemovedRemotely: function(tuple) {
    var position = this.storedTuples.remove(this.buildSortKey(tuple));
    this.onRemoveNode.publish(tuple, position);
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
