Monarch.constructor("FakeServer.FakeRequest", {
  initialize: function(type, url, data, fake_server) {
    this.type = type;
    this.url = url;
    this.data = data;
    this.fake_server = fake_server;
    this.future = new Monarch.Http.AjaxFuture();
  },

  simulate_success: function(data) {
    this.fake_server.remove_request(this);
    this.future.handle_response({
      successful: true,
      data: data
    });
  },

  simulate_failure: function(data) {
    this.fake_server.remove_request(this);
    this.future.handle_response({
      successful: false,
      data: data
    });
  }
});
