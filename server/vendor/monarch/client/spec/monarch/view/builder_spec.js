//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("View.Builder", function() {
    var builder;
    before(function() {
      builder = new View.Builder();
    });

    describe("#a", function() {
      describe("when the 'local' attribute is set to true", function() {
        it("assigns a click callback to the link that invokes jQuery.history.load with the portion of the href following the '#' character", function() {
          mock(jQuery.history, 'load');
          builder.a({'local': true, href: "#bar"}, "Go To The Bar");
          builder.to_view().click();
          expect(jQuery.history.load).to(have_been_called, with_args('bar'));
        });
      });

      describe("when the 'local' attribute is set to false", function() {
        it("assigns a click callback to the link that invokes jQuery.history.load", function() {
          mock(jQuery.history, 'load');
          builder.a({'local': false, href: "isi.edu"}, "Go To The Information Sciences Institute");
          builder.to_view().click();
          expect(jQuery.history.load).to_not(have_been_called);
        });
      });
    });

    describe("#to_view", function() {
      it("invokes the 'initialize' method on the view if it supplied as a property after on_build callbacks have been triggered", function() {
        var on_build_callback = mock_function("on build callback");
        builder.div().on_build(on_build_callback);
        var initialize = mock_function("initialize", function() {
          expect(on_build_callback).to(have_been_called);
        });
        var view = builder.to_view({
          initialize: initialize
        });

        expect(initialize).to(have_been_called, on_object(view));
      });
    });
  });
}});
