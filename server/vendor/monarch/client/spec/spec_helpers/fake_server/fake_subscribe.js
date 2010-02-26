Monarch.constructor("FakeServer.FakeSubscribe", {
  type: "subscribe",

  constructor_initialize: function() {
    this.id_counter = 1;
  },

  initialize: function(url, relations, fake_server) {
    this.url = url;
    this.relations = relations;
    this.fake_server = fake_server;
    this.future = new Monarch.Http.AjaxFuture();
  },

  simulate_success: function() {
    this.future.trigger_success(Monarch.Util.map(this.relations, function(relation) {
      return new Monarch.Http.RemoteSubscription("fake_subscription_" + this.constructor.id_counter++, relation);
    }));
    this.fake_server.remove_request(this);
  }
});
