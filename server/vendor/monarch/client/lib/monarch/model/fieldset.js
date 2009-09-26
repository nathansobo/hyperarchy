constructor("Model.Fieldset", {
  initialize: function(record) {
    if (!record) return;

    this.record = record;
    this.fields_by_column_name = {};
    this.synthetic_fields_by_column_name = {};
    var table = this.record.table();

    var self = this;

    Util.each(table.columns_by_name, function(column_name, column) {
      self.fields_by_column_name[column_name] = new Model.ConcreteField(self, column);
    });

    this.enable_update_events();
  },

  initialize_synthetic_fields: function() {
    var self = this;
    Util.each(this.record.table().synthetic_columns_by_name, function(column_name, column) {
      var signal = column.definition.call(self.record);
      self.synthetic_fields_by_column_name[column_name] = new Model.SyntheticField(self, column, signal);
    });
  },

  new_pending_fieldset: function() {
    return new Model.PendingFieldset(this);
  },

  field: function(column) {
    var column_name = (typeof column == 'string') ? column : column.name;
    var field = this.fields_by_column_name[column_name];
    if (field) return field;
    return this.synthetic_fields_by_column_name[column_name];
  },

  disable_update_events: function() {
    this.update_events_enabled = false;
  },

  enable_update_events: function() {
    this.update_events_enabled = true;
  },

  begin_batch_update: function() {
    this.batched_updates = {};
  },

  batch_update_in_progress: function() {
    return this.batched_updates != null;
  },

  finish_batch_update: function() {
    var batched_updates = this.batched_updates;
    this.batched_updates = null;
    if (this.update_events_enabled && Util.keys(batched_updates).length > 0) {
      this.record.table().record_updated(this.record, batched_updates);
    }
  },

  field_updated: function(field, new_value, old_value) {
    var change_data = {};
    change_data[field.column.name] = {
      column: field.column,
      old_value: old_value,
      new_value: new_value
    };

    if (this.batch_update_in_progress()) {
      jQuery.extend(this.batched_updates, change_data);
    } else {
      if (this.update_events_enabled) this.record.table().record_updated(this.record, change_data);
    }
  },

  wire_representation: function(only_dirty) {
    var wire_representation = {};
    Util.each(this.fields_by_column_name, function(column_name, field) {
      if (!only_dirty || field.dirty) wire_representation[column_name] = field.value_wire_representation();
    });
    return wire_representation;
  }
});
