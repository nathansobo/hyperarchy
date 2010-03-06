Monarch.constructor("FakeServer.FakeCometClient", {
  initialize: function() {
    this.onReceiveNode = new Monarch.SubscriptionNode();
    this.connected = false;
  },
  
  connect: function() {
    this.connected = true;
  },

  onReceive: function(callback) {
    return this.onReceiveNode.subscribe(callback);
  },

  simulateReceive: function(message) {
    this.onReceiveNode.publish(message);
  }
});
