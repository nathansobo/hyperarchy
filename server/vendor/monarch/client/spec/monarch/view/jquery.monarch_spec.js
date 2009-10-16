//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("jQuery.fn.append_view", function() {
    var view;

    before(function() {
      view = Monarch.View.build(function(b) {
        b.div(function() {
          b.div({id: "foo"});
          b.div({id: "bar"});
        })
      });
    });

    it("constructs an anonymous template with the given function as its content method, then generates a view with it, passing this.builder to the function, and appends it to the current jQuery element", function() {
      var click_callback = mock_function("click callback");
      view.find("div#bar").append_view(function(b) {
        b.div({id: "baz"}, "baz").click(click_callback);
      });
      
      view.find("div#bar > div#baz").click();
      expect(click_callback).to(have_been_called);
    });
  });
}});
