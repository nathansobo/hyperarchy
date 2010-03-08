(function(Monarch) {

Monarch.constructor("Monarch.Model.Relations.InnerJoin", Monarch.Model.Relations.Relation, {

  initialize: function(leftOperand, rightOperand, predicate) {
    this.leftOperand = leftOperand;
    this.rightOperand = rightOperand;
    this.predicate = predicate;
    this.initializeEventsSystem();
  },

  allTuples: function() {
    if (this.Tuples) return this.Tuples;

    return Monarch.Util.select(this.cartesianProduct(), function(compositeTuple) {
      return this.predicate.evaluate(compositeTuple);
    }.bind(this));
  },

  wireRepresentation: function() {
    return {
      type: "innerJoin",
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
    Monarch.Util.each(self.leftOperand.allTuples(), function(leftTuple) {
      Monarch.Util.each(self.rightOperand.allTuples(), function(rightTuple) {
        product.push(new Monarch.Model.CompositeTuple(leftTuple, rightTuple));
      });
    })
    return product;
  },

  subscribeToOperands: function() {
    var self = this;
    this.operandsSubscriptionBundle.add(this.leftOperand.onRemoteInsert(function(leftTuple) {
      Monarch.Util.each(self.rightOperand.allTuples(), function(rightTuple) {
        var compositeTuple = new Monarch.Model.CompositeTuple(leftTuple, rightTuple);
        if (self.predicate.evaluate(compositeTuple)) self.tupleInsertedRemotely(compositeTuple);
      });
    }));

    this.operandsSubscriptionBundle.add(this.rightOperand.onRemoteInsert(function(rightTuple) {
      Monarch.Util.each(self.leftOperand.allTuples(), function(leftTuple) {
        var compositeTuple = new Monarch.Model.CompositeTuple(leftTuple, rightTuple);
        if (self.predicate.evaluate(compositeTuple)) self.tupleInsertedRemotely(compositeTuple);
      });
    }));

    this.operandsSubscriptionBundle.add(this.leftOperand.onRemoteRemove(function(leftTuple) {
      Monarch.Util.each(self.allTuples(), function(compositeTuple) {
        if (compositeTuple.leftTuple == leftTuple) self.tupleRemovedRemotely(compositeTuple);
      });
    }));

    this.operandsSubscriptionBundle.add(this.rightOperand.onRemoteRemove(function(rightTuple) {
      Monarch.Util.each(self.allTuples(), function(compositeTuple) {
        if (compositeTuple.rightTuple == rightTuple) self.tupleRemovedRemotely(compositeTuple);
      });
    }));

    this.operandsSubscriptionBundle.add(this.leftOperand.onRemoteUpdate(function(leftTuple, changeset) {
      Monarch.Util.each(self.rightOperand.allTuples(), function(rightTuple) {
        var newCompositeTuple = new Monarch.Model.CompositeTuple(leftTuple, rightTuple);
        var extantCompositeTuple = self.findCompositeTupleThatMatches(newCompositeTuple);
        if (self.predicate.evaluate(newCompositeTuple)) {
          if (extantCompositeTuple) {
            self.tupleUpdatedRemotely(extantCompositeTuple, changeset);
          } else {
            self.tupleInsertedRemotely(newCompositeTuple);
          }
        } else {
          if (extantCompositeTuple) self.tupleRemovedRemotely(extantCompositeTuple);
        }
      });
    }));

    this.operandsSubscriptionBundle.add(this.rightOperand.onRemoteUpdate(function(rightTuple, changeset) {

      Monarch.Util.each(self.leftOperand.allTuples(), function(leftTuple) {
        var newCompositeTuple = new Monarch.Model.CompositeTuple(leftTuple, rightTuple);
        var extantCompositeTuple = self.findCompositeTupleThatMatches(newCompositeTuple);
        if (self.predicate.evaluate(newCompositeTuple)) {
          if (extantCompositeTuple) {
            self.tupleUpdatedRemotely(extantCompositeTuple, changeset);
          } else {
            self.tupleInsertedRemotely(newCompositeTuple);
          }
        } else {
          if (extantCompositeTuple) self.tupleRemovedRemotely(extantCompositeTuple);
        }
      })
    }));
  },

  findCompositeTupleThatMatches: function(compositeTuple1) {
    return Monarch.Util.detect(this.allTuples(), function(compositeTuple2) {
      return compositeTuple1.equals(compositeTuple2);
    })
  }
});

})(Monarch);
