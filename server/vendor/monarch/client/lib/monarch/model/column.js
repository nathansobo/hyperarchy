(function(Monarch) {

Monarch.constructor("Monarch.Model.Column", {
  initialize: function(table, name, type) {
    this.table = table;
    this.name = name;
    this.type = type;
  },

  eq: function(rightOperand) {
    return new Monarch.Model.Predicates.Eq(this, rightOperand);
  },

  asc: function() {
    return new Monarch.Model.OrderByColumn(this, 'asc');
  },

  desc: function() {
    return new Monarch.Model.OrderByColumn(this, 'desc');
  },

  wireRepresentation: function() {
    return {
      type: "column",
      table: this.table.globalName,
      name: Monarch.Inflection.underscore(this.name)
    };
  },

  convertValueForField: function(value) {
    if (this.type == "datetime" && value && typeof value == "number") {
      return new Date(value);
    } else {
      return value;
    }
  },

  convertValueForWire: function(value) {
    if (this.type == "datetime" && value) {
      return value.getTime();
    } else {
      return value;
    }
  },

  as: function(columnAlias) {
    return new Monarch.Model.ProjectedColumn(this, columnAlias);
  }
});

})(Monarch);
