(function(Monarch) {

Monarch.constructor("Monarch.Model.Repository", {
  initialize: function() {
    this.tables = {};
    this.mutations_paused = false;
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

  pause_mutations: function() {
    this.mutations_paused = true;
    this.enqueued_mutations = [];
  },

  resume_mutations: function() {
    this.mutations_paused = false;
    this.mutate(this.enqueued_mutations);
    this.enqueued_mutations = null;
  },

  update: function(dataset) {
    var self = this;
    Monarch.Util.each(dataset, function(table_name, table_dataset) {
      self.tables[table_name].update_contents(table_dataset);
    });
  },

  delta: function(dataset) {
    var self = this;
    Monarch.Util.each(this.tables, function(table_name, table) {
      var table_dataset = dataset[table_name] || {};
      table.delta_contents(table_dataset);
    });
  },

  mutate: function(commands) {
    var self = this;
    if (this.mutations_paused) {
      this.enqueued_mutations.push.apply(this.enqueued_mutations, commands);
    } else {
      Monarch.Util.each(commands, function(command) {
        var type = command.shift();-
        self["perform_" + type + "_command"].apply(self, command);
      });
    }
  },

  perform_create_command: function(table_name, field_values) {
    var table = this.tables[table_name];
    if (table && !table.find(field_values.id)) {
      var record = table.local_create(field_values);
      record.remotely_created(field_values);
    }
  },

  perform_update_command: function(table_name, id, field_values) {
    var table = this.tables[table_name];
    if (!table) return;
    var record = table.find(id);
    if (record) record.remote.update(field_values, new Date());
  },

  perform_destroy_command: function(table_name, id) {
    var table = this.tables[table_name];
    if (!table) return;
    var record = table.find(id);
    if (record) record.remotely_destroyed();
  },

  register_table: function(table) {
    this.tables[table.global_name] = table;
  },

  fixtures: function(fixture_definitions) {
    var self = this;
  },

  load_fixtures: function(fixture_definitions) {
    Monarch.Util.each(fixture_definitions, function(table_name, fixtures) {
      this.tables[table_name].load_fixtures(fixtures);
    }.bind(this));
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
