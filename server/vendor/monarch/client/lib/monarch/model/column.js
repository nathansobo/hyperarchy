(function(Monarch) {

_.constructor("Monarch.Model.Column", {
  initialize: function(table, name, type) {
    this.table = table;
    this.name = name;
    this.type = type;
  },

  eq: function(rightOperand) {
    return new Monarch.Model.Predicates.Eq(this, rightOperand);
  },

  neq: function(rightOperand) {
    return new Monarch.Model.Predicates.Neq(this, rightOperand);
  },

  asc: function() {
    return new Monarch.Model.SortSpecification(this, 'asc');
  },

  desc: function() {
    return new Monarch.Model.SortSpecification(this, 'desc');
  },

  wireRepresentation: function() {
    return {
      type: "column",
      table: this.table.globalName,
      name: _.underscore(this.name)
    };
  },

  convertValueForField: function(value) {
    if (this.type == "datetime" && value && typeof value == "number") {
      return new Date(value);
    } else if (this.type == "key" && !Monarch.Model.allowStringKeys && typeof value == "string") {
      return parseInt(value);
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
