(function(Monarch) {

Monarch.constructor("Monarch.Model.Repository", {
  initialize: function() {
    this.tables = {};
    this.mutationsPaused = false;
  },

  pauseEvents: function() {
    Monarch.Util.each(this.tables, function(name, table) {
      table.pauseEvents();
    });
  },

  resumeEvents: function() {
    Monarch.Util.each(this.tables, function(name, table) {
      table.resumeEvents();
    });
  },

  pauseMutations: function() {
    this.mutationsPaused = true;
    this.enqueuedMutations = [];
  },

  resumeMutations: function() {
    this.mutationsPaused = false;
    this.mutate(this.enqueuedMutations);
    this.enqueuedMutations = null;
  },

  update: function(dataset) {
    var self = this;
    Monarch.Util.each(dataset, function(tableName, tableDataset) {
      self.tables[tableName].updateContents(tableDataset);
    });
  },

  delta: function(dataset) {
    var self = this;
    Monarch.Util.each(this.tables, function(tableName, table) {
      var tableDataset = dataset[tableName] || {};
      table.deltaContents(tableDataset);
    });
  },

  mutate: function(commands) {
    var self = this;
    if (this.mutationsPaused) {
      this.enqueuedMutations.push.apply(this.enqueuedMutations, commands);
    } else {
      Monarch.Util.each(commands, function(command) {
        var type = command.shift();-
        self["perform" + _.capitalize(type) + "Command"].apply(self, command);
      });
    }
  },

  performCreateCommand: function(tableName, fieldValues) {
    var table = this.tables[tableName];
    if (table && !table.find(fieldValues.id)) {
      var record = table.localCreate(fieldValues);
      record.remotelyCreated(fieldValues);
    }
  },

  performUpdateCommand: function(tableName, id, fieldValues) {
    var table = this.tables[tableName];
    if (!table) return;
    var record = table.find(id);
    if (record) record.remote.update(fieldValues, new Date());
  },

  performDestroyCommand: function(tableName, id) {
    var table = this.tables[tableName];
    if (!table) return;
    var record = table.find(id);
    if (record) record.remotelyDestroyed();
  },

  registerTable: function(table) {
    this.tables[table.globalName] = table;
  },

  fixtures: function(fixtureDefinitions) {
    var self = this;
  },

  loadFixtures: function(fixtureDefinitions) {
    Monarch.Util.each(fixtureDefinitions, function(tableName, fixtures) {
      this.tables[tableName].loadFixtures(fixtures);
    }.bind(this));
  },

  clear: function() {
    Monarch.Util.each(this.tables, function(globalName, table) {
      table.clear();
    });
  },

  cloneSchema: function() {
    var clone = new Monarch.Model.Repository();
    Monarch.Util.each(this.tables, function(globalName, table) {
      clone.registerTable(table.cloneSchema());
    });
    return clone;
  }
});

})(Monarch);
