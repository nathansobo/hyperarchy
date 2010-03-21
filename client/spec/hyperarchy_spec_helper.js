//= require <application>
//= require <spec_helpers/fake_server>
//= require <spec_helpers/fake_history>
//= require "spec_helpers/fixtures"
//= require "spec_helpers/fake_application_controller"

Screw.Unit(function(c) { with(c) {
  useFakeHistory();
  useFakeApplicationController();

  init(function() {
    Monarch.Model.allowStringKeys = true;
    window.COMET_CLIENT_ID = "fake-from-spec-helper";
  });
}});

