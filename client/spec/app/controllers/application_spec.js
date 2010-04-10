//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Controllers.Application", function() {
    useFakeServer();
    useRemoteFixtures();

    var controller, mockBody;
    before(function() {
      controller = new Controllers.Application($("<div/>"));
    });

    describe("#navigate", function() {
      before(function() {
        _.each(controller.views, function(view) {
          mock(view, 'show');
          mock(view, 'hide');
        });
      });

      context("when called with '' (empty string)", function() {
        it("shows the login view and hides the others", function() {
          controller.navigate("");
          expect(controller.views.login.show).to(haveBeenCalled);
        });
      });

      context("when called with 'login'", function() {
        it("shows the login view and hides the others", function() {
          controller.navigate("login");
          expect(controller.views.login.show).to(haveBeenCalled);
        });
      });

      context("when called with 'signup'", function() {
        it("shows the signup view and hides the others", function() {
          controller.navigate("signup");
          expect(controller.views.signup.show).to(haveBeenCalled);
        });
      });

      context("when called with 'organizations/:organization_id'", function() {
        it("shows the organizations view and hides the others, then calls #navigate on the view with the given :organization_id", function() {
          mock(controller.views.organizations, 'navigate');
          controller.navigate("organizations/meta");
          expect(controller.views.organizations.show).to(haveBeenCalled);
          expect(controller.views.organizations.navigate).to(haveBeenCalled, withArgs("meta"));

          mock(controller.body, 'append');
          controller.navigate("organizations/restaurant");
          expect(controller.body.append).toNot(haveBeenCalled);
        });
      });

      context("when called with 'organizations'", function() {
        it("shows the organizations view and hides the others, then calls #navigate on the view with null", function() {
          mock(controller.views.organizations, 'navigate');

          controller.navigate("organizations");
          expect(controller.views.organizations.show).to(haveBeenCalled);
          expect(controller.views.organizations.navigate).to(haveBeenCalled, withArgs(null));
        });
      });
    });

    describe("#currentUserIdEstablished", function() {
      it("assigns #currentUserId to the given id", function() {
        expect(controller.currentUserId).to(beNull);
        controller.currentUserIdEstablished('billy');
        expect(controller.currentUserId).to(eq, 'billy');
      });
    });
  });
}});
