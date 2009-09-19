//= require <application>
//= require <spec_helpers/fake_server>
//= require "spec_helpers/fixtures"

Screw.Unit(function(c) { with(c) {

  before(function() {
    window.Application = {
      navigate: function() {
        throw new Error("Mock this function in spec");
      },

      current_user_id_established: function() {
        throw new Error("Mock this function in spec");
      }
    }
  });

  after(function() {
    delete window['Application'];
  });

}});

