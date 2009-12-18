(function(Monarch) {

Monarch.constructor("Monarch.Model.ConcreteField", Monarch.Model.Field, {
  on_update: function(update_callback) {
    if (!this.on_update_node) this.on_update_node = new Monarch.SubscriptionNode();
    this.on_update_node.subscribe(update_callback);
  },

  value: function(value, requested_at) {
    if (arguments.length == 0) {
      return this._value;
    } else {
      this.assign_value(value, requested_at)
      return value;
    }
  },

  // protected

  value_equals: function(value) {
    if (this.column.type == "datetime" && this._value && value) {
      return this._value.getTime() == value.getTime();
    }
    return this._value == value;
  },

  assign_value: function(value, requested_at) {
    value = this.column.convert_value_for_field(value);
    if (!this.value_equals(value)) {
      var old_value = this._value;
      this._value = value;
      this.value_assigned(this._value, old_value, requested_at);
    }
    return value;
  }
});

})(Monarch);
