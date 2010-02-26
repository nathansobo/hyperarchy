(function(Monarch) {

Monarch.constructor("Monarch.Model.RemoteField", Monarch.Model.ConcreteField, {
  initialize: function(fieldset, column) {
    this.fieldset = fieldset;
    this.column = column;
  },

  local_field: function(local_field) {
    if (arguments.length == 0) {
      return this._local_field
    } else {
      return this._local_field = local_field;
    }
  },

  // private

  value_assigned: function(new_value, old_value) {
    this.fieldset.field_updated(this, new_value, old_value);
    if (this.fieldset.update_events_enabled && this.on_update_node) this.on_update_node.publish(new_value, old_value)
    this._local_field.update_events_enabled = false;
    this._local_field.value(new_value);
    this._local_field.mark_clean();
    this._local_field.update_events_enabled = true;
  }
});

})(Monarch);
