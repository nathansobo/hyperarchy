//= require <monarch>
//= require "spec_helpers/fake_server"
//= require "spec_helpers/example_domain_model"
//= require "spec_helpers/fixtures"

Screw.Unit(function(c) {
  c.init(function() {
    Monarch.Model.allowStringKeys = true;
    c.useFakeServer();
    window.COMETCLIENTID = "fake-comet-client-id-from-monarch-spec-helper";
  });
});
