//= require "../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Template", function() {
    var template;

    before(function() {
      constructor("ExampleTemplate", Template, {
        content: function(builder) { with(builder) {
          div(function() {
            dl(function() {
              dt(name);
              dd()
            });
          });
        }}
      });
    });

    after(function() {
      delete window['ExampleTemplate']
    });


    describe("#html", function() {
      it("returns a string built by calling #content with a builder and attributes", function() {

      });
    });
  });
}});