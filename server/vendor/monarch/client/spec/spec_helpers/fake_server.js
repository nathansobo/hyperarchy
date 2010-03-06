//= require "fake_server/fake_server"
//= require "fake_server/fake_comet_client"
//= require "fake_server/fake_command_batch"
//= require "fake_server/fake_request"
//= require "fake_server/fake_fetch"
//= require "fake_server/fake_subscribe"
//= require "fake_server/fake_unsubscribe"
//= require "fake_server/fake_mutation"

Screw.Unit(function(c) {
  c.useFakeServer = function(autoInteract) {
    var originalServer;

    c.init(function() {
      originalServer = Server;
      Server = new FakeServer(autoInteract);
    });

    c.after(function() {
      Server = originalServer;
    })
  };
});
