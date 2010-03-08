(function(Monarch) {

Monarch.constructor("Monarch.Http.CometClient", {
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
      data: { cometClientId: window.COMETCLIENTID, transport: "xhrStream" },
      complete: function() { self.connect() }
    });

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 3) {
        var data = _.trim(xhr.responseText.slice(len));
        len = xhr.responseText.length;
        if (data.length > 0) {
          _.each(data.split("\n"), function(dataChunk) {
            self.onReceiveNode.publish(JSON.parse(dataChunk));
          });
        }
      }
    }
  },

  onReceive: function(callback) {
    return this.onReceiveNode.subscribe(callback);
  }
});

})(Monarch);
