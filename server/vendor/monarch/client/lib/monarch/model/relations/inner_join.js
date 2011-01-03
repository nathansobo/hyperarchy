(function(Monarch) {

_.constructor("Monarch.Model.Relations.InnerJoin", Monarch.Model.Relations.Relation, {

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
    _.each(self.leftOperand.tuples(), function(leftTuple) {
      _.each(self.rightOperand.tuples(), function(rightTuple) {
        product.push(new Monarch.Model.CompositeTuple(leftTuple, rightTuple));
      });
    })
    return product;
  },

  subscribeToOperands: function() {
    var self = this;
    this.operandsSubscriptionBundle.add(this.leftOperand.onInsert(function(leftTuple) {
      _.each(self.rightOperand.tuples(), function(rightTuple) {
        var compositeTuple = new Monarch.Model.CompositeTuple(leftTuple, rightTuple);
        if (self.predicate.evaluate(compositeTuple)) self.tupleInsertedRemotely(compositeTuple);
      });
    }));

    this.operandsSubscriptionBundle.add(this.rightOperand.onInsert(function(rightTuple) {
      _.each(self.leftOperand.tuples(), function(leftTuple) {
        var compositeTuple = new Monarch.Model.CompositeTuple(leftTuple, rightTuple);
        if (self.predicate.evaluate(compositeTuple)) self.tupleInsertedRemotely(compositeTuple);
      });
    }));

    this.operandsSubscriptionBundle.add(this.leftOperand.onRemove(function(leftTuple) {
      _.each(self.tuples(), function(compositeTuple) {
        if (compositeTuple.leftTuple == leftTuple) self.tupleRemovedRemotely(compositeTuple);
      });
    }));

    this.operandsSubscriptionBundle.add(this.rightOperand.onRemove(function(rightTuple) {
      _.each(self.tuples(), function(compositeTuple) {
        if (compositeTuple.rightTuple == rightTuple) self.tupleRemovedRemotely(compositeTuple);
      });
    }));

    this.operandsSubscriptionBundle.add(this.leftOperand.onUpdate(function(leftTuple, changeset) {
      _.each(self.rightOperand.tuples(), function(rightTuple) {
        var newCompositeTuple = new Monarch.Model.CompositeTuple(leftTuple, rightTuple);
        var extantCompositeTuple = self.storedTuples.find(self.buildSortKey(newCompositeTuple, changeset));

        if (self.predicate.evaluate(newCompositeTuple)) {
          if (extantCompositeTuple) {
            self.tupleUpdatedRemotely(extantCompositeTuple, changeset);
          } else {
            self.tupleInsertedRemotely(newCompositeTuple);
          }
        } else {
          if (extantCompositeTuple) {
            self.tupleRemovedRemotely(extantCompositeTuple, changeset);
          }
        }
      });
    }));

    this.operandsSubscriptionBundle.add(this.rightOperand.onUpdate(function(rightTuple, changeset) {
      _.each(self.leftOperand.tuples(), function(leftTuple) {
        var newCompositeTuple = new Monarch.Model.CompositeTuple(leftTuple, rightTuple);
        var extantCompositeTuple = self.storedTuples.find(self.buildSortKey(newCompositeTuple, changeset));

        if (self.predicate.evaluate(newCompositeTuple)) {
          if (extantCompositeTuple) {
            self.tupleUpdatedRemotely(extantCompositeTuple, changeset);
          } else {
            self.tupleInsertedRemotely(newCompositeTuple);
          }
        } else {
          if (extantCompositeTuple) self.tupleRemovedRemotely(extantCompositeTuple, changeset);
        }
      })
    }));
  },

  findCompositeTupleThatMatches: function(compositeTuple1) {
    return _.detect(this.tuples(), function(compositeTuple2) {
      return compositeTuple1.equals(compositeTuple2);
    })
  }
});

})(Monarch);
