//= require "fake_server/fake_server"
//= require "fake_server/fake_comet_client"
//= require "fake_server/fake_command_batch"
//= require "fake_server/fake_request"
//= require "fake_server/fake_fetch"
//= require "fake_server/fake_subscribe"
//= require "fake_server/fake_unsubscribe"
//= require "fake_server/fake_mutation"

Screw.Unit(function(c) {
  c.use_fake_server = function(auto_interact) {
    var original_server;

    c.init(function() {
      original_server = Server;
      Server = new FakeServer(auto_interact);
    });

    c.after(function() {
      Server = original_server;
    })
  };
});
