_.constructor("FakeServer.FakeUpdate", {
  type: 'update',

  initialize: function(fakeServer, record) {
    this.fakeServer = fakeServer;
    this.record = record;
    this.promise = new Monarch.Promise();
  },

  simulateSuccess: function() {
    this.fakeServer.removeRequest(this);
    var fields = _.extend(this.record.dirtyWireRepresentation());
    var changeset = this.record.remotelyUpdated(fields);
    this.promise.triggerSuccess(this.record, changeset);
  }
});