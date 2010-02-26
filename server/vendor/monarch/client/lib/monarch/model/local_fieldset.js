(function(Monarch) {

Monarch.constructor("Monarch.Model.LocalFieldset", Monarch.Model.Fieldset, {
  initialize: function(record, remote) {
    this.record = record;
    this.remote = remote;
    remote.local = this;
    this.initialize_fields();
    this.connect_local_and_remote_fields();
  },

  valid: function() {
    return Monarch.Util.all(this.fields_by_column_name, function(column_name, field) {
      return field.valid();
    });
  },

  all_validation_errors: function() {
    var all_validation_errors = [];
    Monarch.Util.each(this.fields_by_column_name, function(column_name, field) {
      all_validation_errors = all_validation_errors.concat(field.validation_errors);
    });
    return all_validation_errors;
  },

  dirty_wire_representation: function() {
    return this.wire_representation(true)
  },

  wire_representation: function(only_dirty) {
    var wire_representation = {};
    Monarch.Util.each(this.fields_by_column_name, function(column_name, field) {
      if (!only_dirty || field.dirty()) wire_representation[column_name] = field.value_wire_representation();
    });
    return wire_representation;
  },

  clear_validation_errors: function() {
    Monarch.Util.each(this.fields_by_column_name, function(name, field) {
      field.clear_validation_errors();
    });
  },

  assign_validation_errors: function(errors_by_field_name) {
    Monarch.Util.each(this.fields_by_column_name, function(name, field) {
      if (errors_by_field_name[name]) {
        field.assign_validation_errors(errors_by_field_name[name]);
      } else {
        field.clear_validation_errors();
      }

    }.bind(this));
  },

  dirty: function() {
    return Monarch.Util.any(this.fields_by_column_name, function(name, field) {
      return field.dirty();
    });
  },

  field_marked_dirty: function() {
    if (!this._dirty) {
      this._dirty = true;
      this.record.made_dirty();
    }
  },

  field_marked_clean: function() {
    if (!this.dirty()) {
      this._dirty = false;
      this.record.made_clean();
    }
  },

  begin_batch_update: function() {
    this.batch_in_progress = true;
    this.batched_updates = {};
  },

  finish_batch_update: function() {
    this.batch_in_progress = false;
    var changeset = this.batched_updates;
    this.batched_updates = null;

    if (this.update_events_enabled && Monarch.Util.keys(changeset).length > 0) {
      if (this.record.on_local_update_node) this.record.on_local_update_node.publish(changeset);
      if (this.record.after_local_update) this.record.after_local_update(changeset);
      this.record.table.tuple_updated_locally(this.record, changeset);
    }
  },

  field_updated: function(field, new_value, old_value) {
    var batch_was_in_progress = this.batch_in_progress;
    if (!batch_was_in_progress) this.begin_batch_update();

    var change_data = {};
    change_data[field.column.name] = {
      column: field.column,
      old_value: old_value,
      new_value: new_value
    };

    Monarch.Util.extend(this.batched_updates, change_data);

    if (!batch_was_in_progress) this.finish_batch_update();
  },

  // private

  connect_local_and_remote_fields: function() {
    Monarch.Util.each(this.fields_by_column_name, function(column_name, local_field) {
      var remote_field = this.remote.field(column_name);
      local_field.remote_field(remote_field);
      remote_field.local_field(local_field);
    }.bind(this));
  },

  create_new_field: function(column) {
    return new Monarch.Model.LocalField(this, column);
  }
});

})(Monarch);
