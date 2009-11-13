Monarch.constructor("FakeServer.FakeBatch", {
  type: "batch",

  initialize: function(fake_server) {
    this.fake_server = fake_server;
    this.mutations = [];
  },

  find_update: function(record) {
    return Monarch.Util.detect(this.mutations, function(mutation) {
      return mutation.record === record
    });
  },

  add_mutation: function(mutation) {
    mutation.batch = this;
    this.mutations.push(mutation);
  },

  simulate_success: function(server_response) {
    var self = this;
    if (!server_response) server_response = this.generate_fake_server_response();

    Repository.pause_events();

    Monarch.Util.each(this.mutations, function(mutation, index) {
      mutation.complete_and_trigger_before_events(server_response[index]);
    })

    Repository.resume_events();
    
    Monarch.Util.each(this.mutations, function(mutation) {
      mutation.trigger_after_events();
      self.fake_server.remove_request(mutation);
    });

    this.fake_server.remove_request(this);
  },

  generate_fake_server_response: function() {
    return Monarch.Util.map(this.mutations, function(mutation) {
      return mutation.response_wire_representation();
    });
  }
});
