_.constructor("FakeServer.FakeCometClient", {
  initialize: function() {
    this.onReceiveNode = new Monarch.SubscriptionNode();
    this.connected = false;
  },
  
  connect: function() {
    this.connecting = true;
    this.connectFuture = new Monarch.Http.AjaxFuture();
    return this.connectFuture;
  },

  onReceive: function(callback, context) {
    return this.onReceiveNode.subscribe(callback, context);
  },

  simulateReceive: function(message) {
    this.onReceiveNode.publish(message);
  },

  simulateConnectSuccess: function(clientId) {
    this.clientId = clientId;
    this.connecting = false;
    this.connected = true;
    this.connectFuture.triggerSuccess();
    delete this.connectFuture;
  }
});
