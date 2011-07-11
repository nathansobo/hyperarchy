_.constructor("Monarch.Http.FakeServer.FakeUpdate", {
  type: 'update',

  initialize: function(fakeServer, record) {
    this.fakeServer = fakeServer;
    this.record = record;
    this.dirtyFieldValues = record.dirtyWireRepresentation();
    this.pendingVersion = record.nextPendingVersion();
    this.promise = new Monarch.Promise();
  },

  simulateSuccess: function() {
    this.fakeServer.removeRequest(this);
    var changeset = this.record.remotelyUpdated(this.dirtyFieldValues, this.pendingVersion);
    this.promise.triggerSuccess(this.record, changeset);
  }
});