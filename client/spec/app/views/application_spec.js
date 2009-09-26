//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views.Application", function() {
    use_fake_server();
    
    var view;
    before(function() {
      mock(jQuery.history, 'init');
      view = Views.Application.to_view();
    });

    after(function() {
      delete window['Application'];
    });

    describe("#initialize", function() {
      it("assigns the view to the window.Application global", function() {
        expect(window.Application).to(equal, view);
      });

      it("registers its #navigate method with jQuery.history.init", function() {
        expect(jQuery.history.init).to(have_been_called);
        var callback = jQuery.history.init.most_recent_args[0];
        mock(view, 'navigate');
        callback("bar");
        expect(view.navigate).to(have_been_called, with_args("bar"));
      });
    });

    describe("#navigate", function() {
      before(function() {
        mock(view.login_view, 'show');
        mock(view.login_view, 'hide');
        mock(view.signup_view, 'show');
        mock(view.signup_view, 'hide');
        mock(view.elections_view, 'show');
        mock(view.elections_view, 'hide');
      });

      context("when called with '' (empty string)", function() {
        it("shows the login_view and hides the others", function() {
          view.navigate("");

          expect(view.login_view.show).to(have_been_called);
          expect(view.signup_view.hide).to(have_been_called);
          expect(view.elections_view.hide).to(have_been_called);
        });
      });

      context("when called with 'signup'", function() {
        it("shows the signup_view and hides the others", function() {
          view.navigate("signup");

          expect(view.login_view.hide).to(have_been_called);
          expect(view.signup_view.show).to(have_been_called);
          expect(view.elections_view.hide).to(have_been_called);
        });
      });

      context("when called with 'elections'", function() {
        it("shows the elections_view and hides the others", function() {
          view.navigate("elections");

          expect(view.login_view.hide).to(have_been_called);
          expect(view.signup_view.hide).to(have_been_called);
          expect(view.elections_view.show).to(have_been_called);
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
