Monarch.constructor("FakeServer.FakeBatch", {
  type: "batch",

  initialize: function(fake_server) {
    this.fake_server = fake_server;
    this.batched_requests = {};
  },

  add_command: function(command) {
    command.add_to_batch_requests(this.batched_requests);
  },

  find_update: function(record) {
    var commands_for_table = this.batched_requests[record.table().global_name];
    if (!commands_for_table) return null;
    return commands_for_table[record.id()];
  },

  simulate_success: function() {
    Repository.pause_events();
    this.for_each_batched_request(function(request) {
      request.simulate_success();
    });
    Repository.resume_events()
    this.for_each_batched_request(function(request) {
      request.trigger_after_events();
    });


  },

  for_each_batched_request: function(fn) {
    Monarch.Util.values(this.batched_requests, function(requests_by_id) {
      Monarch.Util.values(requests_by_id, function(request) {
        fn(request);
      });
    });
    this.fake_server.remove_request(this);
  }
});
