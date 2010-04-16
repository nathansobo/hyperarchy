//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("jQuery.fn.appendView", function() {
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
      var clickCallback = mockFunction("click callback");
      view.find("div#bar").appendView(function(b) {
        b.div({id: "baz"}, "baz").click(clickCallback);
      });
      
      view.find("div#bar > div#baz").click();
      expect(clickCallback).to(haveBeenCalled);
    });
  });

  describe("jQuery.fn.view", function() {
    after(function() {
      $("#testContent").empty();
    });

    it("returns the view object associated with a DOM node", function() {
      var view = Monarch.View.build(function(b) {
        b.div("testing");
      });

      $("#testContent").append(view);
      var newWrapper = $("#testContent").find("div");
      expect(newWrapper.view()).to(eq, view);
    });
  });
}});
