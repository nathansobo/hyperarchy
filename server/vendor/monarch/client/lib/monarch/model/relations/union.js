(function(Monarch) {

Monarch.constructor("Monarch.Model.Relations.Union", Monarch.Model.Relations.Relation, {
  initialize: function(left_operand, right_operand) {
    this.left_operand = left_operand;
    this.right_operand = right_operand;
    this.initialize_events_system();
  },

  contains: function(record) {
    return record.id() in this.tuples_by_id;
  },

  all_tuples: function() {
    if (this._tuples) return this._tuples;

    var tuples_by_hash_code = {};

    _.each(this.left_operand.all_tuples(), function(tuple) {
      tuples_by_hash_code[tuple.hash_code()] = tuple;
    });
    _.each(this.right_operand.all_tuples(), function(tuple) {
      tuples_by_hash_code[tuple.hash_code()] = tuple;
    });
    return _.values(tuples_by_hash_code);
  },

  surface_tables: function() {
    return this.left_operand.surface_tables();
  },

  // private

  subscribe_to_operands: function() {
    var self = this;
    this.operands_subscription_bundle.add(this.left_operand.on_insert(function(record) {
      if (!self.right_operand.find(record.id())) self.tuple_inserted(record);
    }));

    this.operands_subscription_bundle.add(this.left_operand.on_update(function(record, changes) {
      if (self.contains(record)) self.tuple_updated(record, changes);
    }));

    this.operands_subscription_bundle.add(this.left_operand.on_remove(function(record) {
      if (self.contains(record)) self.tuple_removed(record);
    }));

    this.operands_subscription_bundle.add(this.right_operand.on_insert(function(record) {
      if (self.contains(record)) self.tuple_removed(record);
    }));

    this.operands_subscription_bundle.add(this.right_operand.on_remove(function(record) {
      if (self.left_operand.find(record.id())) self.tuple_inserted(record);
    }));
  }
});

})(Monarch);
