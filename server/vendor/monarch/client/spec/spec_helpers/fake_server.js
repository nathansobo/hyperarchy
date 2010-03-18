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

  Monarch.Model.Relations.Table.prototype.fixture = function(id) {
    var fixture = this.find(id);
    if (!fixture && Server.autoFetch) {
      Server.autoFetch([this.where({id: id})]);
      fixture = this.find(id);
    }
    if (!fixture) throw new Error("No fixture found in  " + this.globalName + " table with id " + id + ".");
    return fixture;
  }
});
