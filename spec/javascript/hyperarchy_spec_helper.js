//= require <hyperarchy>

Screw.Unit(function(c) { with(c) {
  before(function() {
    window.Application = {
      navigate: function() {
        throw new Error("Mock this function in spec");
      },

      post: function() {
        throw new Error("Mock this function in spec");
      }
    }
  });

  after(function() {
    delete window['Application'];
  });
}});