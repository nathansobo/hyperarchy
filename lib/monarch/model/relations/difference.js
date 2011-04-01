(function(Monarch) {

_.constructor("Monarch.Model.Relations.Difference", Monarch.Model.Relations.Relation, {
  numOperands: 2,

  initialize: function(leftOperand, rightOperand) {
    this.leftOperand = leftOperand;
    this.rightOperand = rightOperand;
    this.sortSpecifications = leftOperand.sortSpecifications;
    this.initializeEventsSystem();
  },

  contains: function(record) {
    return record.id() in this.tuplesById;
  },

  tuples: function() {
    if (this.tuplesById) return _.values(this.tuplesById);
    var tuples = [];

    var leftTuples = this.leftOperand.tuples().sort(function(a, b) {
      if (a.id() < b.id()) return -1;
      if (a.id() > b.id()) return 1;
      return 0;
    });

    var rightTuples = this.rightOperand.tuples().sort(function(a, b) {
      if (a.id() < b.id()) return -1;
      if (a.id() > b.id()) return 1;
      return 0;
    });

    var rightIndex = 0;

    _.each(leftTuples, function(leftRecord, index) {
      if (rightTuples[rightIndex] && leftRecord.id() === rightTuples[rightIndex].id()) {
        rightIndex++;
      } else {
        tuples.push(leftRecord);
      }
    });

    return tuples;
  },

  column: function(name) {
    return this.leftOperand.column(name);
  },

  surfaceTables: function() {
    return this.leftOperand.surfaceTables();
  },



  // private

  // overridden so we subscribe to right first, which causes it to get its events before the left (hopefully) so we
  // don't insert and then immediately remove as the left and the right both get the same tuple
  subscribeToOperands: function() {
    this.subscribeToOperand(this.rightOperand, 'right');
    this.subscribeToOperand(this.leftOperand, 'left');
  },

  onLeftOperandInsert: function(tuple, index, newKey, oldKey) {
    if (!this.rightOperand.find(tuple.id())) this.tupleInsertedRemotely(tuple, newKey, oldKey);
  },

  onRightOperandInsert: function(tuple, index, newKey, oldKey) {
    if (this.findByKey(oldKey)) this.tupleRemovedRemotely(tuple);
  },

  onLeftOperandUpdate: function(tuple, changeset, newIndex, oldIndex, newKey, oldKey) {
    if (this.findByKey(oldKey)) this.tupleUpdatedRemotely(tuple, changeset, newKey, oldKey);
  },

  onRightOperandUpdate: function() {
    // no op for now
  },

  onLeftOperandRemove: function(tuple, index, newKey, oldKey) {
    this.onOperandRemove(tuple, index, newKey, oldKey);
  },

  onRightOperandRemove: function(tuple, index, newKey, oldKey) {
    if (this.leftOperand.find(tuple.id())) this.tupleInsertedRemotely(tuple, newKey, oldKey);
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
