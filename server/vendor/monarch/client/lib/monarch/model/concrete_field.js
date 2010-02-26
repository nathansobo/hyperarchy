(function(Monarch) {

Monarch.constructor("Monarch.Model.ConcreteField", Monarch.Model.Field, {
  value: function(value) {
    if (arguments.length == 0) {
      return this._value;
    } else {
      this.assign_value(value)
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

  assign_value: function(value) {
    value = this.column.convert_value_for_field(value);
    if (!this.value_equals(value)) {
      var old_value = this._value;
      this._value = value;
      this.value_assigned(this._value, old_value);
    }
    return value;
  }
});

})(Monarch);
