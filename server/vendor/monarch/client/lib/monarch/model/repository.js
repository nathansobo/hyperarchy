(function(Monarch) {

Monarch.constructor("Monarch.Model.Repository", {
  initialize: function() {
    this.tables = {};
  },

  pause_events: function() {
    Monarch.Util.each(this.tables, function(name, table) {
      table.pause_events();
    });
  },

  resume_events: function() {
    Monarch.Util.each(this.tables, function(name, table) {
      table.resume_events();
    });
  },

  update: function(dataset) {
    var self = this;
    Monarch.Util.each(dataset, function(table_name, table_dataset) {
      self.tables[table_name].update(table_dataset);
    });
  },

  register_table: function(table) {
    this.tables[table.global_name] = table;
  },

  fixtures: function(fixture_definitions) {
    var self = this;
    Monarch.Util.each(fixture_definitions, function(table_name, fixtures) {
      self.tables[table_name].fixtures(fixtures);
    });
  },

  load_fixtures: function(fixture_definitions) {
    if (fixture_definitions) this.fixtures(fixture_definitions);
    Monarch.Util.each(this.tables, function(global_name, table) {
      table.load_fixtures();
    });
  },

  clear: function() {
    Monarch.Util.each(this.tables, function(global_name, table) {
      table.clear();
    });
  },

  clone_schema: function() {
    var clone = new Monarch.Model.Repository();
    Monarch.Util.each(this.tables, function(global_name, table) {
      clone.register_table(table.clone_schema());
    });
    return clone;
  }
});

})(Monarch);
