Monarch.constructor("FakeServer.FakeCommandBatch", {
  type: "batch",

  initialize: function(url, fakeServer, commands) {
    this.url = url;
    this.fakeServer = fakeServer;
    this.commands = commands;
  },

  findUpdate: function(record) {
    return Monarch.Util.detect(this.commands, function(mutation) {
      return mutation.record === record
    });
  },

  perform: function() {
    this.future = new Monarch.Http.RepositoryUpdateFuture();

    if (this.commands.length == 0) {
      this.future.triggerBeforeEvents();
      this.future.triggerAfterEvents();
    } else {
      if (this.fakeServer.auto) {
        this.simulateSuccess();
      } else {
        if (this.commands.length == 1) {
          this.fakeMutation = new FakeServer.FakeMutation(this.url, this.commands[0], this);
          this.fakeServer.addRequest(this.fakeMutation);
        }
        this.fakeServer.batches.push(this);
        this.fakeServer.lastBatch = this;
      }
    }

    return this.future;
  },

  simulateSuccess: function(serverResponse) {
    if (!serverResponse) serverResponse = this.generateFakeServerResponse();

    Repository.pauseEvents();

    _.each(this.commands, function(command, index) {
      command.complete(serverResponse.primary[index]);
    });
    Repository.mutate(serverResponse.secondary)

    this.future.triggerBeforeEvents(this.commands[0].record);
    Repository.resumeEvents();
    this.future.triggerAfterEvents(this.commands[0].record);

    if (this.fakeMutation) this.fakeServer.removeRequest(this.fakeMutation);
    this.fakeServer.removeRequest(this);
  },

  generateFakeServerResponse: function() {
    var primary = Monarch.Util.map(this.commands, function(command) {
      if (command instanceof Monarch.Http.CreateCommand) {
        return Monarch.Util.extend({id: "generatedByFakeServer" + this.fakeServer.idCounter++}, command.fieldValues);
      } else if (command instanceof Monarch.Http.UpdateCommand) {
        return Monarch.Util.extend({}, command.fieldValues);
      } else {
        return null;
      }
    }.bind(this));

    return { primary: primary, secondary: [] }
  }
});
