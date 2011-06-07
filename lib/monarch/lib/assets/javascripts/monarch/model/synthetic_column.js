(function(Monarch) {

_.constructor("Monarch.Model.SyntheticColumn", Monarch.Model.Column, {
  initialize: function(table, name, definition) {
    this.table = table;
    this.name = name;
    this.definition = definition;
  }
});

})(Monarch);
