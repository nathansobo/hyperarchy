(function(Monarch) {

_.constructor("Monarch.Model.Relations.Union", Monarch.Model.Relations.Relation, {
  numOperands: 2,
  
  initialize: function(leftOperand, rightOperand) {
    this.leftOperand = leftOperand;
    this.rightOperand = rightOperand;
    this.sortSpecifications = leftOperand.sortSpecifications;
    this.initializeEventsSystem();
  },

  tuples: function() {
    if (this.storedTuples) return this.storedTuples.values();

    var tuplesByHashCode = {};

    _.each(this.leftOperand.tuples(), function(tuple) {
      tuplesByHashCode[tuple.hashCode()] = tuple;
    });
    _.each(this.rightOperand.tuples(), function(tuple) {
      tuplesByHashCode[tuple.hashCode()] = tuple;
    });
    return _.values(tuplesByHashCode);
  },

  surfaceTables: function() {
    return this.leftOperand.surfaceTables();
  },

  // private

  onLeftOperandInsert: function(tuple, index, newKey, oldKey) {
    if (!this.findByKey(oldKey)) this.tupleInsertedRemotely(tuple);
  },

  onRightOperandInsert: function(tuple, index, newKey, oldKey) {
    if (!this.findByKey(oldKey)) this.tupleInsertedRemotely(tuple);
  },

  onLeftOperandUpdate: function(tuple, changeset, newIndex, oldIndex, newKey, oldKey) {
    if (this.lastChangeset === changeset) return;
    this.lastChangeset = changeset;
    this.tupleUpdatedRemotely(tuple, changeset, newKey, oldKey);
  },

  onRightOperandUpdate: function(tuple, changeset, newIndex, oldIndex, newKey, oldKey) {
    if (this.lastChangeset === changeset) return;
    this.lastChangeset = changeset;
    this.tupleUpdatedRemotely(tuple, changeset, newKey, oldKey);
  },

  onLeftOperandRemove: function(tuple, index, newKey, oldKey) {
    if (!this.rightOperand.find(tuple.id())) this.tupleRemovedRemotely(tuple, newKey, oldKey);
  },

  onRightOperandRemove: function(tuple, index, newKey, oldKey) {
    if (!this.leftOperand.find(tuple.id())) this.tupleRemovedRemotely(tuple, newKey, oldKey);
  },

  // not implemented yet
  onLeftOperandDirty: function() {},
  onRightOperandDirty: function() {},

  onLeftOperandClean: function() {},
  onRightOperandClean: function() {},

  onLeftOperandInvalid: function() {},
  onRightOperandInvalid: function() {},

  onLeftOperandValid: function() {},
  onRightOperandValid: function() {}
});

})(Monarch);
