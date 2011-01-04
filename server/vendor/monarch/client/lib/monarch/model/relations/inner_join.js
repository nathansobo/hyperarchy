(function(Monarch) {

_.constructor("Monarch.Model.Relations.InnerJoin", Monarch.Model.Relations.Relation, {
  numOperands: 2,

  initialize: function(leftOperand, rightOperand, predicate) {
    this.leftOperand = leftOperand;
    this.rightOperand = rightOperand;
    this.predicate = predicate;
    this.sortSpecifications = leftOperand.sortSpecifications.concat(rightOperand.sortSpecifications);
    this.initializeEventsSystem();
  },

  tuples: function() {
    if (this.storedTuples) return this.storedTuples.values();
    return _.filter(this.cartesianProduct(), function(compositeTuple) {
      return this.predicate.evaluate(compositeTuple);
    }, this);
  },

  wireRepresentation: function() {
    return {
      type: "inner_join",
      left_operand: this.leftOperand.wireRepresentation(),
      right_operand: this.rightOperand.wireRepresentation(),
      predicate: this.predicate.wireRepresentation()
    };
  },

  column: function(name) {
    return this.leftOperand.column(name) || this.rightOperand.column(name);
  },

  evaluateInRepository: function(repository) {
    return new Monarch.Model.Relations.InnerJoin(
      this.leftOperand.evaluateInRepository(repository),
      this.rightOperand.evaluateInRepository(repository),
      this.predicate
    );
  },

  surfaceTables: function() {
    return this.leftOperand.surfaceTables().concat(this.rightOperand.surfaceTables());
  },

  // private

  cartesianProduct: function() {
    var product = [];
    var self = this;
    this.leftOperand.each(function(leftTuple) {
      this.rightOperand.each(function(rightTuple) {
        product.push(new Monarch.Model.CompositeTuple(leftTuple, rightTuple));
      }, this);
    }, this)
    return product;
  },

  onLeftOperandInsert: function(leftTuple) {
    this.rightOperand.each(function(rightTuple) {
      this.evaluateCompositeAfterOperandInsert(new Monarch.Model.CompositeTuple(leftTuple, rightTuple));
    }, this);
  },

  onRightOperandInsert: function(rightTuple) {
    this.leftOperand.each(function(leftTuple) {
      this.evaluateCompositeAfterOperandInsert(new Monarch.Model.CompositeTuple(leftTuple, rightTuple));
    }, this);
  },

  evaluateCompositeAfterOperandInsert: function(compositeTuple) {
    if (this.predicate.evaluate(compositeTuple)) {
      var sortKey = this.buildSortKey(compositeTuple);
      this.tupleInsertedRemotely(compositeTuple, sortKey, sortKey);
    }
  },

  onLeftOperandUpdate: function(leftTuple, changeset) {
    this.rightOperand.each(function(rightTuple) {
      this.evaluateCompositeAfterOperandUpdate(new Monarch.Model.CompositeTuple(leftTuple, rightTuple), changeset);
    }, this);
  },

  onRightOperandUpdate: function(rightTuple, changeset) {
    this.leftOperand.each(function(leftTuple) {
      this.evaluateCompositeAfterOperandUpdate(new Monarch.Model.CompositeTuple(leftTuple, rightTuple), changeset);
    }, this);
  },

  evaluateCompositeAfterOperandUpdate: function(compositeTuple, changeset) {
    var newKey = this.buildSortKey(compositeTuple)
    var oldKey = this.buildSortKey(compositeTuple, changeset);
    var extantCompositeTuple = this.findByKey(oldKey);

    if (this.predicate.evaluate(compositeTuple)) {
      if (extantCompositeTuple) {
        this.tupleUpdatedRemotely(extantCompositeTuple, changeset, newKey, oldKey);
      } else {
        this.tupleInsertedRemotely(compositeTuple, newKey, oldKey);
      }
    } else {
      if (extantCompositeTuple) this.tupleRemovedRemotely(extantCompositeTuple, newKey, oldKey);
    }
  },

  onLeftOperandRemove: function(leftTuple, newKey, oldKey) {
    this.each(function(compositeTuple) {
      if (compositeTuple.leftTuple.isEqual(leftTuple)) {
        this.removeCompositeAfterOperandRemove(compositeTuple, oldKey)
      }
    }, this);
  },

  onRightOperandRemove: function(rightTuple, newKey, oldKey) {
    this.each(function(compositeTuple) {
      if (compositeTuple.rightTuple.isEqual(rightTuple)) {
        this.removeCompositeAfterOperandRemove(compositeTuple, oldKey);
      }
    }, this);
  },

  removeCompositeAfterOperandRemove: function(compositeTuple, oldKey) {
    var newCompositeKey = this.buildSortKey(compositeTuple);
    var oldCompositeKey = _.extend({}, newCompositeKey, oldKey);
    this.tupleRemovedRemotely(compositeTuple, newCompositeKey, oldCompositeKey);
  },


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
