(function(Monarch) {

_.constructor("Monarch.Http.CometClient", {
  initialize: function(realTimeClientId) {
    this.realTimeClientId = realTimeClientId;
    this.onReceiveNode = new Monarch.SubscriptionNode();
  },

  connect: function() {
    var self = this;
    var numReceivedCharacters = 0
    var connectFuture = new Monarch.Http.AjaxFuture();

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
              connectFuture.triggerSuccess();
            } else {
              self.onReceiveNode.publish(message);
            }
          });
        } else if (xhr.readyState == 4) {
          self.connect();
        }
      };
    }, 20);

    return connectFuture;
  },

  onReceive: function(callback, context) {
    return this.onReceiveNode.subscribe(callback, context);
  }
});

})(Monarch);
