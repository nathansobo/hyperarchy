(function(Monarch) {

Monarch.constructor("Monarch.Model.CompositeTuple", {
  initialize: function(leftTuple, rightTuple) {
    this.leftTuple = leftTuple;
    this.rightTuple = rightTuple;
  },

  evaluate: function(columnOrConstant) {
    if (columnOrConstant instanceof Monarch.Model.Column) {
      return this.field(columnOrConstant).value();
    } else {
      return columnOrConstant;
    }
  },

  field: function(column) {
    return this.leftTuple.field(column) || this.rightTuple.field(column); 
  },

  record: function(table) {
    return this.leftTuple.record(table) || this.rightTuple.record(table);
  },

  equals: function(other) {
    if (!other.constructor === this.constructor) return false;
    return this.leftTuple.equals(other.leftTuple) && this.rightTuple.equals(other.rightTuple);
  }
});

})(Monarch);
