_.constructor("FakeServer.FakeCometClient", {
  initialize: function() {
    this.onReceiveNode = new Monarch.SubscriptionNode();
    this.connected = false;
  },
  
  connect: function() {
    this.connected = true;
  },

  onReceive: function(callback, context) {
    return this.onReceiveNode.subscribe(callback, context);
  },

  simulateReceive: function(message) {
    this.onReceiveNode.publish(message);
  }
});
