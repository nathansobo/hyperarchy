//= require <monarch>
//= require "spec_helpers/fake_server"
//= require "spec_helpers/example_domain_model"
//= require "spec_helpers/fixtures"

Screw.Unit(function(c) {
  c.init(function() {
    Monarch.Model.allowStringKeys = true;
    c.useFakeServer();
    window.COMET_CLIENT_ID = "fake-comet-client-id-from-monarch-spec-helper";
  });

  c.after(function() {
    Repository.clear();
  });
});
