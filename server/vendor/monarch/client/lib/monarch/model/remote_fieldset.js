(function(Monarch) {

Monarch.constructor("Monarch.Model.RemoteFieldset", Monarch.Model.Fieldset, {
  initialize: function(record) {
    this.record = record;
    this.local = null;
    this.initialize_fields();
    this.batch_update_in_progress = false;
  },

  update: function(field_values, requested_at) {
    if (!requested_at) requested_at = new Date();
    this.batched_updates = {};

    Monarch.Util.each(field_values, function(column_name, field_value) {
      var field = this.field(column_name);
      if (field) field.value(field_value, requested_at);
    }.bind(this));

    var changeset = this.batched_updates;
    this.batched_updates = null;
    if (this.update_events_enabled && Monarch.Util.keys(changeset).length > 0) {
      if (this.record.on_update_node) this.record.on_update_node.publish(changeset);
      this.record.table().tuple_updated(this.record, changeset);
    }

    this.record.remotely_created = true;
    this.update_events_enabled = true;
  },

  field_updated: function(field, new_value, old_value) {
    var change_data = {};
    change_data[field.column.name] = {
      column: field.column,
      old_value: old_value,
      new_value: new_value
    };

    Monarch.Util.extend(this.batched_updates, change_data);
  },

  // private

  create_new_field: function(column) {
    return new Monarch.Model.RemoteField(this, column);
  }
});

})(Monarch);
