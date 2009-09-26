constructor("Model.SyntheticColumn", Model.Column, {
  initialize: function(table, name, definition) {
    this.table = table;
    this.name = name;
    this.definition = definition;
  }
});
