//= require <application>
//= require <spec_helpers/fake_server>
//= require <spec_helpers/fake_history>
//= require "spec_helpers/fixtures"

Screw.Unit(function(c) { with(c) {
  useFakeHistory();

  init(function() {
    Monarch.Model.allowStringKeys = true;
    window.COMET_CLIENT_ID = "fake-from-spec-helper";
  });

  before(function() {
    window.Application = {
      navigate: function() {
        throw new Error("Mock this function in spec");
      },

      currentUserIdEstablished: function() {
        throw new Error("Mock this function in spec");
      }
    }
  });

  after(function() {
    delete window['Application'];
  });

}});

