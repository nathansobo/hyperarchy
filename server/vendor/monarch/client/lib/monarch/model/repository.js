(function(Monarch) {

_.constructor("Monarch.Model.Repository", {
  initialize: function() {
    this.tables = {};
    this.mutationsPausedCount = 0;
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
    this.mutationsPausedCount++;
    if (!this.mutationsPaused) {
      this.mutationsPaused = true;
      this.enqueuedMutations = [];
    }
  },

  resumeMutations: function() {
    this.mutationsPausedCount--;
    if (this.mutationsPausedCount === 0) {
      this.mutationsPaused = false;
      this.mutate(this.enqueuedMutations);
      this.enqueuedMutations = null;
    }
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
    if (record) record.remotelyUpdated(fieldValues);
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
      if (!this.tables[tableName]) throw new Error("No table named " + tableName + " to load fixtures into.");
      this.tables[tableName].loadFixtures(fixtures);
    }, this);
  },

  clear: function() {
    _.each(this.tables, function(table) {
      table.clear();
    });
    this.enqueuedMutations = null;
    this.mutationsPaused = false;
    this.mutationsPausedCount = 0;
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
