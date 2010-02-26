(function(Monarch) {

Monarch.constructor("Monarch.Http.CometClient", {
  initialize: function() {
    this.on_receive_node = new Monarch.SubscriptionNode();
  },

  connect: function() {
    var self = this;
    var len = 0
    session_id = "fake_client_id";

    var xhr = jQuery.ajax({
      type: "post",
      url: Server.comet_hub_url,
      data: { comet_client_id: window.COMET_CLIENT_ID, transport: "xhr_stream" },
      complete: function() { self.connect() }
    });

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 3) {
        var data = Monarch.Util.trim(xhr.responseText.slice(len));
        len = xhr.responseText.length;
        if (data.length > 0) {
          Monarch.Util.each(data.split("\n"), function(data_chunk) {
            self.on_receive_node.publish(JSON.parse(data_chunk));
          });
        }
      }
    }
  },

  on_receive: function(callback) {
    return this.on_receive_node.subscribe(callback);
  }
});

})(Monarch);
