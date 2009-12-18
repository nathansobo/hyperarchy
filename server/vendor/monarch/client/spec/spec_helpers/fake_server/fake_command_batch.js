Monarch.constructor("FakeServer.FakeCommandBatch", {
  type: "batch",

  initialize: function(url, fake_server, commands) {
    this.url = url;
    this.fake_server = fake_server;
    this.commands = commands;
  },

  find_update: function(record) {
    return Monarch.Util.detect(this.commands, function(mutation) {
      return mutation.record === record
    });
  },

  perform: function() {
    this.future = new Monarch.Http.RepositoryUpdateFuture();
    this.requested_at = new Date();

    if (this.commands.length == 0) {
      this.future.trigger_before_events();
      this.future.trigger_after_events();
    } else {
      if (this.fake_server.auto) {
        this.simulate_success();
      } else {
        if (this.commands.length == 1) {
          this.fake_mutation = new FakeServer.FakeMutation(this.url, this.commands[0], this);
          this.fake_server.add_request(this.fake_mutation);
        }
        this.fake_server.batches.push(this);
        this.fake_server.last_batch = this;
      }
    }

    return this.future;
  },

  simulate_success: function(server_response) {
    if (!server_response) server_response = this.generate_fake_server_response();

    Repository.pause_events();

    Monarch.Util.each(this.commands, function(command, index) {
      command.complete(server_response.primary[index], this.requested_at);
    });
    Repository.mutate(server_response.secondary)

    this.future.trigger_before_events(this.commands[0].record);
    Repository.resume_events();
    this.future.trigger_after_events(this.commands[0].record);

    if (this.fake_mutation) this.fake_server.remove_request(this.fake_mutation);
    this.fake_server.remove_request(this);
  },

  generate_fake_server_response: function() {
    var primary = Monarch.Util.map(this.commands, function(command) {
      if (command instanceof Monarch.Http.CreateCommand) {
        return Monarch.Util.extend({id: "generated_by_fake_server_" + this.fake_server.id_counter++}, command.field_values);
      } else if (command instanceof Monarch.Http.UpdateCommand) {
        return Monarch.Util.extend({}, command.field_values);
      } else {
        return null;
      }
    }.bind(this));

    return { primary: primary, secondary: [] }
  }
});
