//= require ./fake_server/fake_server
//= require ./fake_server/fake_comet_client
//= require ./fake_server/fake_request
//= require ./fake_server/fake_fetch
//= require ./fake_server/fake_subscribe
//= require ./fake_server/fake_unsubscribe
//= require ./fake_server/fake_mutation
//= require ./fake_server/fake_creation
//= require ./fake_server/fake_update
//= require ./fake_server/fake_destruction

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
    if (!fixture && Server.autoFetch && Server.Repository.tables[this.globalName]) {
      Server.autoFetch([this.where({id: id})]);
      fixture = this.find(id);
    }
    if (!fixture) throw new Error("No fixture found in  " + this.globalName + " table with id " + id + ".");
    return fixture;
  }
});
