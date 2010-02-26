Monarch.constructor("FakeServer.FakeUnsubscribe", {
  type: "unsubscribe",
  
  initialize: function(url, remote_subscriptions, fake_server) {
    this.url = url;
    this.remote_subscriptions = remote_subscriptions;
    this.future = new Monarch.Http.AjaxFuture();
    this.fake_server = fake_server;
  },

  simulate_success: function() {
    this.future.trigger_success("");
    this.fake_server.remove_request(this);
  }
});
