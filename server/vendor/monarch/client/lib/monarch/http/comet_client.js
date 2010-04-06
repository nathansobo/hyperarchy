(function(Monarch) {

_.constructor("Monarch.Http.CometClient", {
  initialize: function() {
    this.onReceiveNode = new Monarch.SubscriptionNode();
  },

  connect: function() {
    var self = this;
    var len = 0
    sessionId = "fakeClientId";

    var xhr = jQuery.ajax({
      type: "post",
      url: Server.cometHubUrl,
      data: { client_id: self.clientId },
      complete: function() { self.connect() }
    });

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 3) {
        var data = _.trim(xhr.responseText.slice(len));
        console.debug(data);
        len = xhr.responseText.length;
        if (data.length > 0) {
          _.each(data.split("\n"), function(messageString) {
            var message = JSON.parse(messageString);
            if (message[0] == "connected") {
              self.clientId = message[1];
            } else {
              self.onReceiveNode.publish(message);
            }
          });
        }
      }
    }
  },

  onReceive: function(callback, context) {
    return this.onReceiveNode.subscribe(callback, context);
  }
});

})(Monarch);
