(function(Monarch) {

Monarch.constructor("Monarch.Model.Relations.Projection", Monarch.Model.Relations.Relation, {
  initialize: function(operand, projected_columns) {
    var self = this;
    this.operand = operand;
    this.projected_columns_by_name = {};
    Monarch.Util.each(projected_columns, function(projected_column) {
      self.projected_columns_by_name[projected_column.name()] = projected_column;
    });

    this.tuple_constructor = Monarch.ModuleSystem.constructor(Monarch.Model.Tuple);
    this.tuple_constructor.projected_columns_by_name = this.projected_columns_by_name;
    this.tuple_constructor.initialize_field_readers();

    this.initialize_events_system();
  },

  all_tuples: function() {
    if (this._tuples) return this._tuples;

    this.tuples_by_operand_record_id = {};
    return Monarch.Util.map(this.operand.all_tuples(), function(operand_tuple) {
      return this.tuples_by_operand_record_id[operand_tuple.id()] = new this.tuple_constructor(operand_tuple);
    }.bind(this));
  },

  column: function(name) {
    return this.projected_columns_by_name[name];
  },

  surface_tables: function() {
    throw new Error("Projections do not have surface tables");
  },
  
  // private

  subscribe_to_operands: function() {
    var self = this;
    this.operands_subscription_bundle.add(this.operand.on_remote_insert(function(operand_record) {
      var record = new self.tuple_constructor(operand_record);
      self.tuples_by_operand_record_id[operand_record.id()] = record;
      self.tuple_inserted_remotely(record);
    }));
    this.operands_subscription_bundle.add(this.operand.on_remote_update(function(operand_record, operand_changes) {
      var changes = self.translate_update_changes(operand_changes);
      if (Monarch.Util.is_empty(changes)) return;
      self.tuple_updated_remotely(self.tuples_by_operand_record_id[operand_record.id()], changes);
    }));
    this.operands_subscription_bundle.add(this.operand.on_remote_remove(function(operand_record) {
      self.tuple_removed_remotely(self.tuples_by_operand_record_id[operand_record.id()]);
    }));
  },

  translate_update_changes: function(changes) {
    var self = this;
    var translated_changes = {};
    Monarch.Util.each(changes, function(operand_column_name, operand_column_changes) {
      var projected_column = self.projected_column_from_operand_column(operand_column_changes.column);
      if (projected_column) {
        translated_changes[projected_column.name()] = {
          column: projected_column,
          old_value: operand_column_changes.old_value,
          new_value: operand_column_changes.new_value
        }
      }
    });
    return translated_changes;
  },

  projected_column_from_operand_column: function(operand_column) {
    return Monarch.Util.detect(this.projected_columns_by_name, function(name, projected_column) {
      return projected_column.column === operand_column;
    });
  }
});

})(Monarch);
