(function(Monarch) {

Monarch.constructor("Monarch.Model.Repository", {
  initialize: function() {
    this.tables = {};
    this.mutationsPaused = false;
  },

  pauseEvents: function() {
    _.each(this.tables, function(table) {
      table.pauseEvents();
    });
  },

  resumeEvents: function() {
    _.each(this.tables, function(table) {
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
    _.each(dataset, function(tableDataset, tableName) {
      this.tables[tableName].updateContents(tableDataset);
    }, this);
  },

  delta: function(dataset) {
    _.each(this.tables, function(table, tableName) {
      var tableDataset = dataset[tableName] || {};
      table.deltaContents(tableDataset);
    });
  },

  mutate: function(commands) {
    if (this.mutationsPaused) {
      this.enqueuedMutations.push.apply(this.enqueuedMutations, commands);
    } else {
      _.each(commands, function(command) {
        var type = command.shift();
        this["perform" + _.capitalize(type) + "Command"].apply(this, command);
      }, this);
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

  loadFixtures: function(fixtureDefinitions) {
    _.each(fixtureDefinitions, function(fixtures, tableName) {
      this.tables[tableName].loadFixtures(fixtures);
    }, this);
  },

  clear: function() {
    _.each(this.tables, function(table) {
      table.clear();
    });
  },

  cloneSchema: function() {
    var clone = new Monarch.Model.Repository();
    _.each(this.tables, function(table) {
      clone.registerTable(table.cloneSchema());
    });
    return clone;
  }
});

})(Monarch);
