(function(Monarch) {

Monarch.constructor("Monarch.Model.Relations.Difference", Monarch.Model.Relations.Relation, {
  initialize: function(left_operand, right_operand) {
    this.left_operand = left_operand;
    this.right_operand = right_operand;
    this.initialize_events_system();
  },

  contains: function(record) {
    return record.id() in this.tuples_by_id;
  },

  all_tuples: function() {
    if (this.tuples_by_id) return Monarch.Util.values(this.tuples_by_id);
    var tuples = [];

    var left_tuples = this.left_operand.all_tuples().sort(function(a, b) {
      if (a.id() < b.id()) return -1;
      if (a.id() > b.id()) return 1;
      return 0;
    });

    var right_tuples = this.right_operand.all_tuples().sort(function(a, b) {
      if (a.id() < b.id()) return -1;
      if (a.id() > b.id()) return 1;
      return 0;
    });

    var right_index = 0;

    Monarch.Util.each(left_tuples, function(left_record, index) {
      if (right_tuples[right_index] && left_record.id() === right_tuples[right_index].id()) {
        right_index++;
      } else {
        tuples.push(left_record);
      }
    });

    return tuples;
  },

  column: function(name) {
    return this.left_operand.column(name);
  },

  surface_tables: function() {
    return this.left_operand.surface_tables();
  },

  // private

  subscribe_to_operands: function() {
    var self = this;
    this.operands_subscription_bundle.add(this.left_operand.on_remote_insert(function(record) {
      if (!self.right_operand.find(record.id())) self.tuple_inserted_remotely(record);
    }));

    this.operands_subscription_bundle.add(this.left_operand.on_remote_update(function(record, changes) {
      if (self.contains(record)) self.tuple_updated_remotely(record, changes);
    }));

    this.operands_subscription_bundle.add(this.left_operand.on_remote_remove(function(record) {
      if (self.contains(record)) self.tuple_removed_remotely(record);
    }));

    this.operands_subscription_bundle.add(this.right_operand.on_remote_insert(function(record) {
      if (self.contains(record)) self.tuple_removed_remotely(record);
    }));

    this.operands_subscription_bundle.add(this.right_operand.on_remote_remove(function(record) {
      if (self.left_operand.find(record.id())) self.tuple_inserted_remotely(record);
    }));
  },

  memoize_tuples: function() {
    var tuples_by_id = {};
    this.each(function(record) {
      tuples_by_id[record.id()] = record;
    }.bind(this));
    this.tuples_by_id = tuples_by_id;
  },

  tuple_inserted_remotely: function(record, options) {
    this.tuples_by_id[record.id()] = record;
    this.on_remote_insert_node.publish(record);
  },

  tuple_updated_remotely: function(record, update_data) {
    this.on_remote_update_node.publish(record, update_data);
  },

  tuple_removed_remotely: function(record) {
    delete this.tuples_by_id[record.id()];
    this.on_remote_remove_node.publish(record);
  }
});

})(Monarch);
