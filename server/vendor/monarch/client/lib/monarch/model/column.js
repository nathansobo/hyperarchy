(function(Monarch) {

_.constructor("Monarch.Model.Column", {
  initialize: function(table, name, type) {
    this.table = table;
    this.name = name;
    this.globalName = _.underscore(name);
    this.qualifiedName = table.globalName + "." + this.globalName;
    this.type = type;
  },

  eq: function(rightOperand) {
    return new Monarch.Model.Predicates.Eq(this, rightOperand);
  },

  neq: function(rightOperand) {
    return new Monarch.Model.Predicates.Neq(this, rightOperand);
  },

  gt: function(rightOperand) {
    return new Monarch.Model.Predicates.Gt(this, rightOperand);
  },

  gte: function(rightOperand) {
    return new Monarch.Model.Predicates.Gte(this, rightOperand);
  },

  lt: function(rightOperand) {
    return new Monarch.Model.Predicates.Lt(this, rightOperand);
  },

  lte: function(rightOperand) {
    return new Monarch.Model.Predicates.Lte(this, rightOperand);
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
      name: this.globalName
    };
  },

  convertValueForField: function(value) {
    if (this.type == "datetime" && value && _.isNumber(value)) {
      return new Date(value);
    } else if (this.type == "integer" && value && _.isString(value)) {
      return parseInt(value);
    } else if (this.type == "float" && value && _.isString(value)) {
      return parseFloat(value)
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
