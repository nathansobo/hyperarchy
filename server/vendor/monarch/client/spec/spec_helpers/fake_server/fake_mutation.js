_.constructor("FakeServer.FakeMutation", {
  constructorInitialize: function() {
    this.idCounter = 1;
  },

  initialize: function(url, command, fakeServer) {
    this.url = url;
    this.command = command;
    this.fakeServer = fakeServer;
    this.type = _.underscore(command.constructor.basename).split("_")[0];
    this.table = command.table;
    this.record = command.record;
    this.fieldValues = command.fieldValues;
    this.tableName = command.tableName;
  },

  perform: function() {
    this.fakeServer.addRequest(this);
    if (this.fakeServer.auto) this.simulateSuccess();
    return this.command.future;
  },

  simulateSuccess: function(simulatedResponse) {
    this.command.handleSuccessfulResponse(simulatedResponse || this.generateFakeServerResponse())
    this.fakeServer.removeRequest(this);
  },

  generateFakeServerResponse: function() {
    var responseWireRepresentation;
    switch (this.type) {
      case "update":
        responseWireRepresentation = this.fieldValues;
        break;
      case "create":
        responseWireRepresentation = jQuery.extend({}, this.fieldValues, { id: this.generateFakeId() });
        break;
      case "destroy":
        responseWireRepresentation = null;
        break;
    }
    return { primary: [responseWireRepresentation], secondary: [] }
  },

  generateFakeId: function() {
    return "fake-" + (this.fakeServer.idCounter++).toString()
  }
});
