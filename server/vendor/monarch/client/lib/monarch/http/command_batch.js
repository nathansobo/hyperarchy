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
      this.requested_at = new Date();
      this.server.post(Repository.origin_url, { operations: this.wire_representation() })
        .on_success(function(response_data) {
          self.handle_successful_response(response_data);
        })
        .on_failure(function(response_data) {
          self.handle_unsuccessful_response(response_data);
        });
    } else {
      this.future.trigger_before_events();
      this.future.trigger_after_events();
    }

    return this.future;
  },

  // private

  wire_representation: function() {
    return Monarch.Util.map(this.commands, function(command) {
      return command.wire_representation();
    });
  },

  handle_successful_response: function(response_data) {
    Repository.pause_events();
    Monarch.Util.each(this.commands, function(command, index) {
      command.complete(response_data.primary[index], this.requested_at);
    }.bind(this));
    Repository.mutate(response_data.secondary);
    this.future.trigger_before_events(this.commands[0].record);
    Repository.resume_events();
    this.future.trigger_after_events(this.commands[0].record);
  },

  handle_unsuccessful_response: function(response_data) {
    Monarch.Util.each(this.commands, function(command, index) {
      if (index == response_data.index) {
        command.handle_failure(response_data.errors, this.requested_at);
        this.future.trigger_on_failure(command.record);
      } else {
        command.handle_failure(null);
      }
    }.bind(this));
  }
});

})(Monarch);
