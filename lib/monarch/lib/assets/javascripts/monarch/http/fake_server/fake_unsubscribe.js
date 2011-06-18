_.constructor("Monarch.Http.FakeServer.FakeUnsubscribe", {
  type: "unsubscribe",
  
  initialize: function(url, remoteSubscriptions, fakeServer) {
    this.url = url;
    this.remoteSubscriptions = remoteSubscriptions;
    this.future = new Monarch.Http.AjaxFuture();
    this.fakeServer = fakeServer;
  },

  simulateSuccess: function() {
    this.future.triggerSuccess("");
    this.fakeServer.removeRequest(this);
  }
});
