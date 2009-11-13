(function(Monarch) {

Monarch.constructor("Monarch.Model.ConcreteField", Monarch.Model.Field, {
  initialize: function(fieldset, column) {
    this.fieldset = fieldset;
    this.column = column;
    this.on_update_node = new Monarch.SubscriptionNode();
    this.validation_errors = [];
  },

  valid: function() {
    return (this.validation_errors.length == 0);
  },

  clone_pending_field: function(fieldset) {
    var pending_field = new Monarch.Model.ConcreteField(fieldset, this.column);
    pending_field._value = this._value;
    pending_field.pending = true;
    return pending_field;
  },

  value: function(value) {
    if (arguments.length == 1) {
      if (this._value != value) return this.assign_value(value);
    } else {
      return this._value;
    }
  },

  assign_value: function(value) {

    var batch_update_in_progress = this.fieldset.batch_update_in_progress();
    if (!batch_update_in_progress) this.fieldset.begin_batch_update();
    var old_value = this._value;
    this._value = this.column.convert_for_storage(value);
    if (this.pending) {
      this.dirty = true;
    } else {
      this.fieldset.field_updated(this, this._value, old_value);
      if (this.fieldset.update_events_enabled) this.on_update_node.publish(this._value, old_value)
    }
    if (!batch_update_in_progress) this.fieldset.finish_batch_update();

    return this._value;
  },

  value_wire_representation: function() {
    return this.column.convert_for_wire(this.value());
  }
});

})(Monarch);
