//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views.Login", function() {
    var view;
    before(function() {
      view = Views.Login.to_view();
    });


    describe("when #login_submit is clicked", function() {
      before(function() {
        view.find('#email_address').val("cobham@gmail.com");
        view.find('#password').val("spectrum");

        expect(Application.posts).to(be_empty);
        view.find('#login_submit').click();

      });

      it("posts the form field values to /login", function() {
        expect(Application.posts.length).to(equal, 1);
        expect(Application.last_post.url).to(equal, "/login");
        expect(Application.last_post.data).to(equal, {
          email_address: "cobham@gmail.com",
          password: "spectrum"
        });
      });


      context("when the result is successful", function() {
        it("sets the Application.current_user_id and navigates to #elections if the result is successful", function() {
          mock(jQuery.history, 'load', function() {
            expect(Application.current_user_id).to(equal, "billy");
          });
          Application.last_post.simulate_success({
            current_user_id: "billy"
          });
          expect(jQuery.history.load).to(have_been_called, with_args("elections"));
        });
      })

      context("when the result is unsuccessful", function() {
        it("displays the error and does not set the Application.current_user_id or navigate to #elections", function() {
          mock(jQuery.history, 'load');
          Application.last_post.simulate_failure({
            errors: {
              password: "Your password did not match the given email address."
            }
          });
          expect(jQuery.history.load).to_not(have_been_called);
          expect(view.html()).to(match, "Your password did not match the given email address.");
        });
      })

    });
  });
}});