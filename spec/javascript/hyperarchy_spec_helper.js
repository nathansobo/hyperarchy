//= require <hyperarchy>

Screw.Unit(function(c) { with(c) {
  before(function() {
    window.Application = {
      navigate: function() {
      }
    }
  });

  after(function() {
    delete window['Application'];
  });
}});