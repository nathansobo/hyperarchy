Monarch.constructor("FakeServer.FakeDestroy", {
  type: "destroy",

  initialize: function(url, record, fake_server) {
    this.url = url;
    this.record = record;
    this.fake_server = fake_server;
    this.future = new Monarch.Http.RepositoryUpdateFuture();
    this.in_batch = false;
  },

  add_to_batch_requests: function(commands) {
    this.in_batch = true;
    var table_name = this.record.table().global_name;
    if (!commands[table_name]) commands[table_name] = {};
    commands[table_name][this.record.id()] = this;
  },

  simulate_success: function() {
    if (!this.in_batch) Repository.pause_events();
    this.future.trigger_before_events(this.record);
    this.record.table().remove(this.record);
    if (!this.in_batch) {
      Repository.resume_events();
      this.future.trigger_after_events(this.record);
    }
    this.fake_server.remove_request(this);
  },

  trigger_after_events: function() {
    this.future.trigger_after_events(this.record);
  }
});
