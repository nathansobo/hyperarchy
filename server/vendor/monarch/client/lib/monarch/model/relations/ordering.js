constructor("Model.Relations.Ordering", Model.Relations.Relation, {
  initialize: function(operand, order_by_columns) {
    this.operand = operand;
    this.order_by_columns = order_by_columns;

    var self = this;
    this.comparator = function(a, b) {
      for(var i = 0; i < self.order_by_columns.length; i++) {
        var order_by_column = self.order_by_columns[i]
        var column = order_by_column.column;
        var direction_coefficient = order_by_column.direction_coefficient;

        var a_value = a.field(column).value();
        var b_value = b.field(column).value();

        if (a_value < b_value) return -1 * direction_coefficient;
        else if (a_value > b_value) return 1 * direction_coefficient;
      }
      return 0;
    }
  },

  all: function() {
    return this.operand.all().sort(this.comparator);
  },

  evaluate_in_repository: function(repository) {
    return new Model.Relations.Ordering(this.operand.evaluate_in_repository(repository), this.order_by_columns);
  },

  primary_table: function() {
    return this.operand.primary_table();
  },

  wire_representation: function() {
    return this.operand.wire_representation();
  }
})
