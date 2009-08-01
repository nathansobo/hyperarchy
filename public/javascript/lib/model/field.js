constructor("Model.Field", {
  initialize: function(record, attribute) {
    this.record = record;
    this.attribute = attribute;
  },

  value: function(value) {
    if (value) {
      return this._value = value;
    } else {
      return this._value;
    }
  }
});