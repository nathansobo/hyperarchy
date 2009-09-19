constructor("Model.Column", {
  initialize: function(table, name, type) {
    this.table = table;
    this.name = name;
    this.type = type;
  },

  eq: function(right_operand) {
    return new Model.Predicates.Eq(this, right_operand);
  },


  wire_representation: function() {
    return {
      type: "column",
      table: this.table.global_name,
      name: this.name
    };
  }
});
