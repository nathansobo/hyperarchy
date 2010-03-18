(function(Monarch) {

Monarch.constructor("Monarch.Http.CommandBatch", {
  initialize: function(server, commands) {
    this.server = server;
    this.commands = commands;
  },

  perform: function() {
    this.future = new Monarch.Http.AjaxFuture();

    if (this.commands.length > 0) {
      this.server.post(Repository.originUrl + "/mutate", { operations: this.wireRepresentation() })
        .onSuccess(function(responseData) {
          this.handleSuccessfulResponse(responseData);
        }, this)
        .onFailure(function(responseData) {
          this.handleUnsuccessfulResponse(responseData);
        }, this);
    } else {
      this.future.updateRepositoryAndTriggerCallbacks(null, _.identity);
    }

    return this.future;
  },

  // private

  wireRepresentation: function() {
    return _.map(this.commands, function(command) {
      return command.wireRepresentation();
    });
  },

  handleSuccessfulResponse: function(responseData) {
    this.future.updateRepositoryAndTriggerCallbacks(this.commands[0].record, _.bind(function() {
      _.each(this.commands, function(command, index) {
        command.complete(responseData.primary[index]);
      });
      Repository.mutate(responseData.secondary);
    }, this));
  },

  handleUnsuccessfulResponse: function(responseData) {
    _.each(this.commands, function(command, index) {
      if (index == responseData.index) {
        command.handleFailure(responseData.errors);
        this.future.triggerFailure(command.record);
      } else {
        command.handleFailure(null);
      }
    }, this);
  }
});

})(Monarch);
