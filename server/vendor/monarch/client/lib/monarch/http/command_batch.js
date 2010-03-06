(function(Monarch) {

Monarch.constructor("Monarch.Http.CommandBatch", {
  initialize: function(server, commands) {
    this.server = server;
    this.commands = commands;
  },

  perform: function() {
    var self = this;
    this.future = new Monarch.Http.RepositoryUpdateFuture();

    if (this.commands.length > 0) {
      this.server.post(Repository.originUrl + "/mutate", { operations: this.wireRepresentation() })
        .onSuccess(function(responseData) {
          self.handleSuccessfulResponse(responseData);
        })
        .onFailure(function(responseData) {
          self.handleUnsuccessfulResponse(responseData);
        });
    } else {
      this.future.triggerBeforeEvents();
      this.future.triggerAfterEvents();
    }

    return this.future;
  },

  // private

  wireRepresentation: function() {
    return Monarch.Util.map(this.commands, function(command) {
      return command.wireRepresentation();
    });
  },

  handleSuccessfulResponse: function(responseData) {
    Repository.pauseEvents();
    Monarch.Util.each(this.commands, function(command, index) {
      command.complete(responseData.primary[index]);
    }.bind(this));
    Repository.mutate(responseData.secondary);
    this.future.triggerBeforeEvents(this.commands[0].record);
    Repository.resumeEvents();
    this.future.triggerAfterEvents(this.commands[0].record);
  },

  handleUnsuccessfulResponse: function(responseData) {
    Monarch.Util.each(this.commands, function(command, index) {
      if (index == responseData.index) {
        command.handleFailure(responseData.errors);
        this.future.triggerOnFailure(command.record);
      } else {
        command.handleFailure(null);
      }
    }.bind(this));
  }
});

})(Monarch);
