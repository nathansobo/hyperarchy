_.constructor("FakeServer.FakeUpdate", {
  type: 'update',

  initialize: function(fakeServer, record) {
    this.fakeServer = fakeServer;
    this.record = record;
    this.promise = new Monarch.Promise();
  },

  simulateSuccess: function() {
    this.fakeServer.removeRequest(this);
    var changeset = this.record.remotelyUpdated(this.record.dirtyWireRepresentation());
    this.promise.triggerSuccess(this.record, changeset);
  }
});