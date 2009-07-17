//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views.Application", function() {
    var view;
    before(function() {
      view = Views.Application.to_view();
    });

    after(function() {
      delete window['Application'];
    });

    describe("#initialize", function() {
      it("assigns the view to the window.Application global", function() {
        expect(window.Application).to(equal, view);
      });
    });

    describe("#navigate", function() {
      context("when called with 'signup'", function() {
        it("shows the signup_view and hides the others", function() {
          expect(view.find("#login_view:visible")).to_not(be_empty);
          expect(view.find("#elections_view:hidden")).to_not(be_empty);
          expect(view.find("#signup_view:hidden")).to_not(be_empty);
          view.navigate("signup");
          expect(view.find("#login_view:hidden")).to_not(be_empty);
          expect(view.find("#elections_view:hidden")).to_not(be_empty);
          expect(view.find("#signup_view:visible")).to_not(be_empty);
        });
      });
    });
  });
}});