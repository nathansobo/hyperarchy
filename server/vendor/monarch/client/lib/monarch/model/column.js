constructor("Model.Column", {
  initialize: function(table, name, type) {
    this.table = table;
    this.name = name;
    this.type = type;
  },

  eq: function(right_operand) {
    return new Model.Predicates.Eq(this, right_operand);
  },

  asc: function() {
    return new Model.OrderByColumn(this, 'asc');
  },

  desc: function() {
    return new Model.OrderByColumn(this, 'desc');
  },

  wire_representation: function() {
    return {
      type: "column",
      table: this.table.global_name,
      name: this.name
    };
  }
});
