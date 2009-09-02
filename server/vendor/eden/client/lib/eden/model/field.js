constructor("Model.Field", {
  initialize: function(record, column) {
    this.record = record;
    this.column = column;
  },

  value: function(value) {
    if (value) {
      return this._value = value;
    } else {
      return this._value;
    }
  }
});