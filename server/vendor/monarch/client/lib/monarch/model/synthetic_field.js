(function(Monarch) {

Monarch.constructor("Monarch.Model.SyntheticField", Monarch.Model.Field, {
  initialize: function(fieldset, column, signal) {
    this.fieldset = fieldset;
    this.local = (fieldset instanceof Monarch.Model.LocalFieldset);
    this.signal = signal;
    this.column = column;
    this.subscribe_to_field_updates();
  },

  value: function(value) {
    if (arguments.length == 0) {
      return this.local ? this.signal.local_value() : this.signal.remote_value();
    } else if (this.column.setter) {
      this.column.setter.call(this.fieldset.record, value);
    } else {
      throw new Error("No setter method defined on the synthetic column " + this.column.name);
    }
  },

  // private

  subscribe_to_field_updates: function() {
    var update_handler = function(new_value, old_value) {
      this.fieldset.field_updated(this, new_value, old_value);
      if (this.fieldset.update_events_enabled && this.on_update_node) this.on_update_node.publish(new_value, old_value);
    }.bind(this)

    if (this.local) {
      this.signal.on_local_update(update_handler);
    } else {
      this.signal.on_remote_update(update_handler);
    }
  }
});

})(Monarch);
