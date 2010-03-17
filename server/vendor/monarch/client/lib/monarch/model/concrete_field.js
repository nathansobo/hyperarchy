(function(Monarch) {

Monarch.constructor("Monarch.Model.ConcreteField", Monarch.Model.Field, {
  value: {
    writer: function(value) {
      value = this.column.convertValueForField(value);
      if (this.valueEquals(value)) return;
      var oldValue = this._value;
      this._value = value;
      this.valueAssigned(this._value, oldValue);
    }
  },

  // protected

  valueEquals: function(value) {
    if (this.column.type == "datetime" && this.value() && value) {
      return this.value().getTime() == value.getTime();
    }
    return this.value() == value;
  }

});

})(Monarch);
