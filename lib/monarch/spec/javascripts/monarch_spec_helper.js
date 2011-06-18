//= require monarch
//= require monarch/http/fake_server
//= require ./spec_helpers/example_domain_model
//= require ./spec_helpers/fixtures
//= require ./spec_helpers/ajax_mocking

Screw.Unit(function(c) {
  c.init(function() {
    Monarch.Model.allowStringKeys = true;
    c.useFakeServer();
    window.COMET_CLIENT_ID = "fake-comet-client-id-from-monarch-spec-helper";
  });

  c.after(function() {
    Repository.clear();
  });

  c.useFakeServer = function(autoInteract) {
    var originalServer;

    c.init(function() {
      originalServer = Server;
      Server = new Monarch.Http.FakeServer(autoInteract);
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
    if (!fixture) throw new Error("No fixture found in  " + this.globalName + " table with id " + id);
    return fixture;
  };
});
