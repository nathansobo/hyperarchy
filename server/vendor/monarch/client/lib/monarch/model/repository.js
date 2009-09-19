constructor("Model.Repository", {
  initialize: function() {
    this.tables = {};
  },

  remote_create: function(relation, field_values) {
    return Origin.post(this.origin_url, {
      relation: relation.wire_representation(),
      field_values: field_values
    });
  },

  fetch: function(relations) {
    return Origin.fetch(this.origin_url, relations);
  },

  pause_delta_events: function() {
    Util.each(this.tables, function(name, table) {
      table.pause_delta_events();
    });
  },

  resume_delta_events: function() {
    Util.each(this.tables, function(name, table) {
      table.resume_delta_events();
    });
  },

  update: function(dataset) {
    var self = this;
    Util.each(dataset, function(table_name, table_dataset) {
      self.tables[table_name].update(table_dataset);
    });
  },

  register_table: function(table) {
    this.tables[table.global_name] = table;
  },

  fixtures: function(fixture_definitions) {
    var self = this;
    Util.each(fixture_definitions, function(table_name, fixtures) {
      self.tables[table_name].fixtures(fixtures);
    });
  },

  load_fixtures: function(fixture_definitions) {
    if (fixture_definitions) this.fixtures(fixture_definitions);
    Util.each(this.tables, function(global_name, table) {
      table.load_fixtures();
    });
  },

  clear: function() {
    Util.each(this.tables, function(global_name, table) {
      table.clear();
    });
  },

  clone_schema: function() {
    var clone = new Model.Repository();
    Util.each(this.tables, function(global_name, table) {
      clone.register_table(table.clone_schema());
    });
    return clone;
  }
});
