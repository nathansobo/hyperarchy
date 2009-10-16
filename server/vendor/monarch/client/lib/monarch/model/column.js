(function(Monarch) {

Monarch.constructor("Monarch.Model.Column", {
  initialize: function(table, name, type) {
    this.table = table;
    this.name = name;
    this.type = type;
  },

  eq: function(right_operand) {
    return new Monarch.Model.Predicates.Eq(this, right_operand);
  },

  asc: function() {
    return new Monarch.Model.OrderByColumn(this, 'asc');
  },

  desc: function() {
    return new Monarch.Model.OrderByColumn(this, 'desc');
  },

  wire_representation: function() {
    return {
      type: "column",
      table: this.table.global_name,
      name: this.name
    };
  },

  convert_for_storage: function(value) {
    if (this.type == "datetime" && value && typeof value == "number") {
      return new Date(value);
    } else {
      return value;
    }
  },

  convert_for_wire: function(value) {
    if (this.type == "datetime" && value) {
      return value.getTime();
    } else {
      return value;
    }
  },

  as: function(column_alias) {
    return new Monarch.Model.ProjectedColumn(this, column_alias);
  }
});

})(Monarch);
