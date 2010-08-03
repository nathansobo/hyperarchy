(function(Monarch) {

_.constructor("Monarch.Http.CometClient", {
  initialize: function() {
    this.onReceiveNode = new Monarch.SubscriptionNode();
  },

  connect: function() {
    var self = this;
    var numReceivedCharacters = 0
    var connectFuture = new Http.AjaxFuture();

    _.delay(function() {
      var xhr = jQuery.ajax({
        type: "post",
        url: Server.cometHubUrl,
        data: { client_id: self.clientId },
      });

      xhr.onreadystatechange = function() {
        if (xhr.readyState == 3) {
          var data = _.trim(xhr.responseText.slice(numReceivedCharacters));
          numReceivedCharacters = xhr.responseText.length;
          if (data.length > 0) {
            _.each(data.split("\n"), function(messageString) {
              var message = JSON.parse(messageString);
              if (message[0] == "connected") {
                self.clientId = message[1];
                connectFuture.triggerSuccess();
              } else {
                self.onReceiveNode.publish(message);
              }
            });
          }
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
