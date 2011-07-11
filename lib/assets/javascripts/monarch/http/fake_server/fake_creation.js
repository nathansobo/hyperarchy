_.constructor("Monarch.Http.FakeServer.FakeCreation", {
  type: 'create',

  initialize: function(fakeServer, record) {
    this.fakeServer = fakeServer;
    this.record = record;
    this.promise = new Monarch.Promise();
  },

  simulateSuccess: function() {
    this.fakeServer.removeRequest(this);
    var fields = _.extend({id: this.fakeServer.idCounter++ }, this.record.dirtyWireRepresentation());
    this.record.remotelyCreated(fields);
    this.promise.triggerSuccess(this.record);
  }
});