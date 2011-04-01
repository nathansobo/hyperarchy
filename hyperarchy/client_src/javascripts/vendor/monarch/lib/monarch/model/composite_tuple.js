(function(Monarch) {

_.constructor("Monarch.Model.CompositeTuple", {
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

  isEqual: function(other) {
    if (!other.constructor === this.constructor) return false;
    return this.leftTuple.isEqual(other.leftTuple) && this.rightTuple.isEqual(other.rightTuple);
  },

  wireRepresentation: function() {
    return [this.leftTuple.wireRepresentation(), this.rightTuple.wireRepresentation()]
  }
});

})(Monarch);
