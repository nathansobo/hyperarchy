(function(Monarch) {

_.constructor("Monarch.Http.CometClient", {
  initialize: function(realTimeClientId) {
    this.realTimeClientId = realTimeClientId;
    this.onReceiveNode = new Monarch.SubscriptionNode();
    this.onDisconnectNode = new Monarch.SubscriptionNode();
    this.connectionRetryAttempts = 0;
  },

  connect: function(delay) {
    var self = this;
    var numReceivedCharacters = 0
    var connectFuture = new Monarch.Http.AjaxFuture();
    if (!delay) delay = 20;

    _.delay(function() {
      var xhr = jQuery.ajax({
        type: "post",
        url: Server.cometHubUrl,
        data: { real_time_client_id: self.realTimeClientId }
      });

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 3) {
          var unreadCharacters = xhr.responseText.slice(numReceivedCharacters);
          var lastNewlineIndex = unreadCharacters.lastIndexOf("\n")
          if (lastNewlineIndex < 0) return;
          var unreadLines = unreadCharacters.slice(0, lastNewlineIndex + 1);
          numReceivedCharacters += unreadLines.length;
          unreadLines = _.trim(unreadLines);
          if (unreadLines.length === 0) return;
          _.each(unreadLines.split("\n"), function(messageString) {
            try {
              var message = JSON.parse(messageString);
            } catch(e) {
              // Special error handling added 12/14/10 -- Remove if we haven't seen any issues in a while
              var errorReport = "In comet client, while attempting to parse the following JSON string:\n" +
                messageString + "\n\n" +
                e.stack;

              if (window.console) {
                console.debug("ERROR: " + errorReport);
              }

              Server.post("/client_error", {error: errorReport });
            }

            if (message[0] == "connected") {
              self.connected();
              connectFuture.triggerSuccess();
            } else {
              self.onReceiveNode.publish(message);
            }
          });
        } else if (xhr.readyState == 4) {
          self.disconnected();
        }
      };
    }, delay);

    return connectFuture;
  },

  connected: function() {
    console.debug("connected!");
    this.connectionRetryAttempts = 0;
  },

  disconnected: function() {
    if (this.connectionRetryAttempts === 0) {
      this.connectionRetryAttempts += 1;
      console.debug("retrying once");
      this.connect();
    } else if (this.connectionRetryAttempts === 1) {
      console.debug("retrying twice in 2.5 seconds");
      this.connectionRetryAttempts += 1;
      this.connect(2500);
    } else {
      this.onDisconnectNode.publish();
    }
  },

  onReceive: function(callback, context) {
    return this.onReceiveNode.subscribe(callback, context);
  },

  onDisconnect: function(callback, context) {
    return this.onDisconnectNode.subscribe(callback, context);
  },

  nowMilliseconds: function() {
    return new Date().getTime();
  }
});

})(Monarch);
