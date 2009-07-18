//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views.Application", function() {
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
      context("when called with '' (empty string)", function() {
        it("shows the login_view and hides the others", function() {
          view.navigate("signup");
          expect(view.find("#login_view:hidden")).to_not(be_empty);
          expect(view.find("#elections_view:hidden")).to_not(be_empty);
          expect(view.find("#signup_view:visible")).to_not(be_empty);
          view.navigate("");
          expect(view.find("#login_view:visible")).to_not(be_empty);
          expect(view.find("#elections_view:hidden")).to_not(be_empty);
          expect(view.find("#signup_view:hidden")).to_not(be_empty);
        });
      });

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

    describe("#post", function() {
      it("calls jQuery.ajax with request type 'post', returning an AjaxFuture whose #handle_response method is called upon receiving a response", function() {
        mock(jQuery, 'ajax');

        var data = {
          full_name: "Snoop Dogg",
          password: "shiznit",
          email_address: "snoop21@aol.com"
        };
        var future = view.post("/users", data);
        expect(jQuery.ajax).to(have_been_called, once);

        var ajax_options = jQuery.ajax.most_recent_args[0];
        expect(ajax_options.url).to(equal, '/users');
        expect(ajax_options.type).to(equal, 'POST');
        expect(ajax_options.dataType).to(equal, 'json');
        expect(ajax_options.data).to(equal, data);

        expect(future.constructor).to(equal, AjaxFuture);

        mock(future, 'handle_response');

        var response_json = {
          success: true,
          data: {
            foo: "bar"
          }
        };
        ajax_options.success(response_json);
        expect(future.handle_response).to(have_been_called, with_args(response_json));
      });
    });
  });
}});