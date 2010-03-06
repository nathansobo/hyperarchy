Monarch.constructor("FakeServer.FakeRequest", {
  initialize: function(type, url, data, fakeServer) {
    this.type = type;
    this.url = url;
    this.data = data;
    this.fakeServer = fakeServer;
    this.future = new Monarch.Http.AjaxFuture();
  },

  simulateSuccess: function(data) {
    this.fakeServer.removeRequest(this);
    this.future.handleResponse({
      successful: true,
      data: data
    });
  },

  simulateFailure: function(data) {
    this.fakeServer.removeRequest(this);
    this.future.handleResponse({
      successful: false,
      data: data
    });
  }
});
