constructor("Model.Field", {
  initialize: function(tuple, attribute) {
    this.tuple = tuple;
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