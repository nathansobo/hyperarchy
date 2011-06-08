(function(Monarch) {

_.constructor("Monarch.Http.Command", {
  initialize: function(record, server) {
    this.record = record;
    this.server = server;
    this.future = new Monarch.Http.AjaxFuture();
  },

  perform: function() {
    this.server.post(Repository.sandboxUrl + "/mutate", { operations: [this.wireRepresentation()] })
      .success(this.hitch('handleSuccessfulResponse'))
      .onFailure(this.hitch('handleUnsuccessfulResponse'))
    return this.future;
  },

  handleSuccessfulResponse: function(data) {
    this.future.updateRepositoryAndTriggerCallbacks(this.record, this.bind(function() {
      this.complete(data.primary[0]);
      Repository.mutate(data.secondary);
    }));
  },

  handleUnsuccessfulResponse: function(data) {
    this.handleFailure(data.errors);
    this.future.triggerFailure(this.record);
  }
});

})(Monarch);
