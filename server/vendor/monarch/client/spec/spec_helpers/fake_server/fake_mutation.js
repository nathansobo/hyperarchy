_.constructor("FakeServer.FakeMutation", {
  constructorInitialize: function() {
    this.idCounter = 1;
  },

  initialize: function(url, command, batch) {
    this.url = url;
    this.command = command;
    this.batch = batch;
    this.type = _.underscore(command.constructor.basename).split("_")[0];
    this.table = command.table;
    this.record = command.record;
    this.fieldValues = command.fieldValues;
    this.tableName = command.tableName;
  },

  complete: function(fieldValues) {
    this.command.complete(fieldValues);
  },

  triggerBeforeEvents: function() {
    this.command.triggerBeforeEvents();
  },

  triggerAfterEvents: function() {
    this.command.triggerAfterEvents();
  },

  responseWireRepresentation: function() {
    switch (this.type) {
      case "update":
        return this.fieldValues;
      case "create":
        return jQuery.extend({}, this.fieldValues, { id: (this.constructor.idCounter++).toString() });
      case "destroy":
        return null;
    }
  },

  simulateSuccess: function(fakeResponse) {
    this.batch.simulateSuccess(fakeResponse ? { primary: [fakeResponse], secondary: []} : null);
  }
});
