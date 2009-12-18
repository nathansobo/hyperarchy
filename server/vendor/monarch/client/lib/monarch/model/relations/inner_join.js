(function(Monarch) {

Monarch.constructor("Monarch.Model.Relations.InnerJoin", Monarch.Model.Relations.Relation, {

  initialize: function(left_operand, right_operand, predicate) {
    this.left_operand = left_operand;
    this.right_operand = right_operand;
    this.predicate = predicate;
    this.initialize_events_system();
  },

  all_tuples: function() {
    if (this._tuples) return this._tuples;

    return Monarch.Util.select(this.cartesian_product(), function(composite_tuple) {
      return this.predicate.evaluate(composite_tuple);
    }.bind(this));
  },

  wire_representation: function() {
    return {
      type: "inner_join",
      left_operand: this.left_operand.wire_representation(),
      right_operand: this.right_operand.wire_representation(),
      predicate: this.predicate.wire_representation()
    };
  },

  column: function(name) {
    return this.left_operand.column(name) || this.right_operand.column(name);
  },

  evaluate_in_repository: function(repository) {
    return new Monarch.Model.Relations.InnerJoin(
      this.left_operand.evaluate_in_repository(repository),
      this.right_operand.evaluate_in_repository(repository),
      this.predicate
    );
  },

  surface_tables: function() {
    return this.left_operand.surface_tables().concat(this.right_operand.surface_tables());
  },

  // private

  cartesian_product: function() {
    var product = [];
    var self = this;
    Monarch.Util.each(self.left_operand.all_tuples(), function(left_tuple) {
      Monarch.Util.each(self.right_operand.all_tuples(), function(right_tuple) {
        product.push(new Monarch.Model.CompositeTuple(left_tuple, right_tuple));
      });
    })
    return product;
  },

  subscribe_to_operands: function() {
    var self = this;
    this.operands_subscription_bundle.add(this.left_operand.on_insert(function(left_tuple) {
      Monarch.Util.each(self.right_operand.all_tuples(), function(right_tuple) {
        var composite_tuple = new Monarch.Model.CompositeTuple(left_tuple, right_tuple);
        if (self.predicate.evaluate(composite_tuple)) self.tuple_inserted(composite_tuple);
      });
    }));

    this.operands_subscription_bundle.add(this.right_operand.on_insert(function(right_tuple) {
      Monarch.Util.each(self.left_operand.all_tuples(), function(left_tuple) {
        var composite_tuple = new Monarch.Model.CompositeTuple(left_tuple, right_tuple);
        if (self.predicate.evaluate(composite_tuple)) self.tuple_inserted(composite_tuple);
      });
    }));

    this.operands_subscription_bundle.add(this.left_operand.on_remove(function(left_tuple) {
      Monarch.Util.each(self.all_tuples(), function(composite_tuple) {
        if (composite_tuple.left_tuple == left_tuple) self.tuple_removed(composite_tuple);
      });
    }));

    this.operands_subscription_bundle.add(this.right_operand.on_remove(function(right_tuple) {
      Monarch.Util.each(self.all_tuples(), function(composite_tuple) {
        if (composite_tuple.right_tuple == right_tuple) self.tuple_removed(composite_tuple);
      });
    }));

    this.operands_subscription_bundle.add(this.left_operand.on_update(function(left_tuple, changeset) {
      Monarch.Util.each(self.right_operand.all_tuples(), function(right_tuple) {
        var new_composite_tuple = new Monarch.Model.CompositeTuple(left_tuple, right_tuple);
        var extant_composite_tuple = self.find_composite_tuple_that_matches(new_composite_tuple);
        if (self.predicate.evaluate(new_composite_tuple)) {
          if (extant_composite_tuple) {
            self.tuple_updated(extant_composite_tuple, changeset);
          } else {
            self.tuple_inserted(new_composite_tuple);
          }
        } else {
          if (extant_composite_tuple) self.tuple_removed(extant_composite_tuple);
        }
      });
    }));

    this.operands_subscription_bundle.add(this.right_operand.on_update(function(right_tuple, changeset) {

      Monarch.Util.each(self.left_operand.all_tuples(), function(left_tuple) {
        var new_composite_tuple = new Monarch.Model.CompositeTuple(left_tuple, right_tuple);
        var extant_composite_tuple = self.find_composite_tuple_that_matches(new_composite_tuple);
        if (self.predicate.evaluate(new_composite_tuple)) {
          if (extant_composite_tuple) {
            self.tuple_updated(extant_composite_tuple, changeset);
          } else {
            self.tuple_inserted(new_composite_tuple);
          }
        } else {
          if (extant_composite_tuple) self.tuple_removed(extant_composite_tuple);
        }
      })
    }));
  },

  find_composite_tuple_that_matches: function(composite_tuple_1) {
    return Monarch.Util.detect(this.all_tuples(), function(composite_tuple_2) {
      return composite_tuple_1.equals(composite_tuple_2);
    })
  }
});

})(Monarch);
