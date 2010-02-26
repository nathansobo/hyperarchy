Monarch.constructor("FakeServer.FakeCometClient", {
  initialize: function() {
    this.on_receive_node = new Monarch.SubscriptionNode();
    this.connected = false;
  },
  
  connect: function() {
    this.connected = true;
  },

  on_receive: function(callback) {
    return this.on_receive_node.subscribe(callback);
  },

  simulate_receive: function(message) {
    this.on_receive_node.publish(message);
  }
});
