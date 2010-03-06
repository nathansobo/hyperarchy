(function(Monarch) {

Monarch.constructor("Monarch.Model.ConcreteField", Monarch.Model.Field, {
  value: function(value) {
    if (arguments.length == 0) {
      return this.Value;
    } else {
      this.assignValue(value)
      return value;
    }
  },

  // protected

  valueEquals: function(value) {
    if (this.column.type == "datetime" && this.Value && value) {
      return this.Value.getTime() == value.getTime();
    }
    return this.Value == value;
  },

  assignValue: function(value) {
    value = this.column.convertValueForField(value);
    if (!this.valueEquals(value)) {
      var oldValue = this.Value;
      this.Value = value;
      this.valueAssigned(this.Value, oldValue);
    }
    return value;
  }
});

})(Monarch);
