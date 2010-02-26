(function(Monarch) {

Monarch.constructor("Monarch.Model.ProjectedColumn", {
  initialize: function(column, column_alias) {
    this.column = column;
    this.column_alias = column_alias;
  },

  name: function() {
    return this.column_alias || this.column.name;
  },

  eq: function(right_operand) {
    return new Monarch.Model.Predicates.Eq(this, right_operand);
  },

  asc: function() {
    return new Monarch.Model.OrderByColumn(this, 'asc');
  },

  desc: function() {
    return new Monarch.Model.OrderByColumn(this, 'desc');
  }
});

})(Monarch);
