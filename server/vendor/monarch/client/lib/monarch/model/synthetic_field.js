(function(Monarch) {

Monarch.constructor("Monarch.Model.SyntheticField", Monarch.Model.Field, {
  initialize: function(fieldset, column, signal) {
    this.fieldset = fieldset;
    this.signal = signal;
    this.column = column;
    this.on_update_node = new Monarch.SubscriptionNode();

    var self = this;
    this.signal.on_update(function(new_value, old_value) {
      self.fieldset.field_updated(self, new_value, old_value);
      if (self.fieldset.update_events_enabled) self.on_update_node.publish(self, new_value, old_value)
    });
  },

  value: function(value) {
    if (arguments.length == 0) {
      return this.signal.value();
    } else if (this.column.setter) {
      this.column.setter.call(this.fieldset.record, value);
    } else {
      throw new Error("No setter method defined on the synthetic column " + this.column.name);
    }
  }
});

})(Monarch);
