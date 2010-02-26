(function(Monarch) {

Monarch.constructor("Monarch.Model.Relations.Ordering", Monarch.Model.Relations.Relation, {
  initialize: function(operand, order_by_columns) {
    this.operand = operand;
    this.order_by_columns = order_by_columns;

    var self = this;
    this.comparator = function(a, b) {
      for(var i = 0; i < self.order_by_columns.length; i++) {
        var order_by_column = self.order_by_columns[i]
        var column = order_by_column.column;
        var direction_coefficient = order_by_column.direction_coefficient;

        var a_value = a.field(column).value();
        var b_value = b.field(column).value();

        if (a_value < b_value) return -1 * direction_coefficient;
        else if (a_value > b_value) return 1 * direction_coefficient;
      }
      return 0;
    }
    this.initialize_events_system();
  },

  all_tuples: function() {
    return this.operand.all_tuples().sort(this.comparator);
  },

  create: function(field_values) {
    return this.operand.create(field_values);
  },

  local_create: function(field_values) {
    return this.operand.local_create(field_values);
  },

  evaluate_in_repository: function(repository) {
    return new Monarch.Model.Relations.Ordering(this.operand.evaluate_in_repository(repository), this.order_by_columns);
  },

  primary_table: function() {
    return this.operand.primary_table();
  },

  wire_representation: function() {
    return this.operand.wire_representation();
  },

  surface_tables: function() {
    return this.operand.surface_tables();
  },

  column: function(name) {
    return this.operand.column(name);
  },

  // private

  subscribe_to_operands: function() {
    var self = this;
    this.operands_subscription_bundle.add(this.operand.on_remote_insert(function(record) {
      self.tuple_inserted_remotely(record);
    }));

    this.operands_subscription_bundle.add(this.operand.on_remote_remove(function(record) {
      self.tuple_removed_remotely(record);
    }));

    this.operands_subscription_bundle.add(this.operand.on_remote_update(function(record, changed_fields) {
      self.tuple_updated_remotely(record, changed_fields);
    }));

    this.operands_subscription_bundle.add(this.operand.on_dirty(function(record) {
      self.record_made_dirty(record);
    }));

    this.operands_subscription_bundle.add(this.operand.on_clean(function(record) {
      self.record_made_clean(record);
    }));
  }
})

})(Monarch);
