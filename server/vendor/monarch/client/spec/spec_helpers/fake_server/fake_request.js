Monarch.constructor("FakeServer.FakeRequest", {
  initialize: function(type, url, data) {
    this.future = new Monarch.Http.AjaxFuture();
    this.type = type;
    this.url = url;
    this.data = data;
  },

  simulate_success: function(data) {
    this.future.handle_response({
      successful: true,
      data: data
    });
  },

  simulate_failure: function(data) {
    this.future.handle_response({
      successful: false,
      data: data
    });
  }
});
