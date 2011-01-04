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
    return this.operand.tuples().sort(this.hitch('compareTuples'));
  },

  compareTuples: function(a, b) {
    return this.comparator(this.buildSortKey(a), this.buildSortKey(b));
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

  isEqual: function(other) {
    if (other.constructor !== this.constructor) return false;
    return _.isEqual(this.sortSpecifications, other.sortSpecifications) && this.operand.isEqual(other.operand);
  },

  // private

  onOperandInsert: function(tuple) {
    this.tupleInsertedRemotely(tuple);
  },

  onOperandUpdate: function(tuple, changset) {
    this.tupleUpdatedRemotely(tuple, changset);
  },

  onOperandRemove: function(tuple) {
    this.tupleRemovedRemotely(tuple);
  }
})

})(Monarch);
