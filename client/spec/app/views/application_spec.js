//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views.Application", function() {
    use_fake_server();
    use_remote_fixtures();

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

      it("registers its #navigate method with History.load", function() {
        mock(view, 'navigate');
        History.load("bar");
        expect(view.navigate).to(have_been_called, with_args("bar"));
      });
    });

    describe("#navigate", function() {
      before(function() {
        mock(view.main_views.login, 'show');
        mock(view.main_views.login, 'hide');
        mock(view.main_views.signup, 'show');
        mock(view.main_views.signup, 'hide');
        mock(view.main_views.elections, 'show');
        mock(view.main_views.elections, 'hide');
      });

      context("when called with '' (empty string)", function() {
        it("shows the login view and hides the others", function() {
          view.navigate("");

          expect(view.main_views.login.show).to(have_been_called);
          expect(view.main_views.signup.hide).to(have_been_called);
          expect(view.main_views.elections.hide).to(have_been_called);
        });
      });

      context("when called with 'signup'", function() {
        it("shows the signup view and hides the others", function() {
          view.navigate("signup");

          expect(view.main_views.login.hide).to(have_been_called);
          expect(view.main_views.signup.show).to(have_been_called);
          expect(view.main_views.elections.hide).to(have_been_called);
        });
      });

      context("when called with 'elections'", function() {
        it("shows the elections view and hides the others", function() {
          view.navigate("elections");

          expect(view.main_views.login.hide).to(have_been_called);
          expect(view.main_views.signup.hide).to(have_been_called);
          expect(view.main_views.elections.show).to(have_been_called);
        });
      });
    });

    describe("#current_user_id_established", function() {
      it("assigns #current_user_id to the given id", function() {
        expect(view.current_user_id).to(be_null);
        view.current_user_id_established('billy');
        expect(view.current_user_id).to(equal, 'billy');
      });
    });
  });
}});
