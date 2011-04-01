_.constructor("FakeServer.FakeRequest", {
  initialize: function(type, url, data, fakeServer) {
    this.type = type;
    this.url = url;
    this.data = data;
    this.fakeServer = fakeServer;
    this.future = new Monarch.Http.AjaxFuture();
  },

  simulateSuccess: function(data, dataset) {
    this.fakeServer.removeRequest(this);
    this.future.handleResponse({
      successful: true,
      data: data,
      dataset: dataset
    });
  },

  simulateFailure: function(data) {
    this.fakeServer.removeRequest(this);
    this.future.handleResponse({
      successful: false,
      data: data
    });
  },

  simulateError: function() {
    this.fakeServer.removeRequest(this);
    this.future.triggerError();
  }
});
