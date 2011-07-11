_.constructor("Monarch.Http.FakeServer.FakeDestruction", {
  type: 'destroy',

  initialize: function(fakeServer, record) {
    this.fakeServer = fakeServer;
    this.record = record;
    this.promise = new Monarch.Promise();
  },

  simulateSuccess: function() {
    this.fakeServer.removeRequest(this);
    this.record.remotelyDestroyed();
    this.promise.triggerSuccess(this.record);
  }
});