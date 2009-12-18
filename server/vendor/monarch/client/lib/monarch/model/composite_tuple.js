(function(Monarch) {

Monarch.constructor("Monarch.Model.CompositeTuple", {
  initialize: function(left_tuple, right_tuple) {
    this.left_tuple = left_tuple;
    this.right_tuple = right_tuple;
  },

  evaluate: function(column_or_constant) {
    if (column_or_constant instanceof Monarch.Model.Column) {
      return this.field(column_or_constant).value();
    } else {
      return column_or_constant;
    }
  },

  field: function(column) {
    return this.left_tuple.field(column) || this.right_tuple.field(column); 
  },

  record: function(table) {
    return this.left_tuple.record(table) || this.right_tuple.record(table);
  },

  equals: function(other) {
    if (!other.constructor === this.constructor) return false;
    return this.left_tuple.equals(other.left_tuple) && this.right_tuple.equals(other.right_tuple);
  }
});

})(Monarch);
