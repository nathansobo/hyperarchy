//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views.Signup", function() {
    var view;
    before(function() {
      view = Views.Signup.to_view();
    });

    describe("when #signup_submit is clicked", function() {
      it("posts to the form attributes '/users', then sets the Application.current_user_id and navigates to #elections if the result is successful", function() {
        view.find('#full_name').val("Billy Cobham");
        view.find('#email_address').val("cobham@gmail.com");
        view.find('#password').val("spectrum");

        expect(Application.posts).to(be_empty);
        view.find('#signup_submit').click();

        expect(Application.posts.length).to(equal, 1);
        expect(Application.last_post.url).to(equal, "/users");
        expect(Application.last_post.data).to(equal, {
          full_name: "Billy Cobham",
          email_address: "cobham@gmail.com",
          password: "spectrum"
        });

        mock(jQuery.history, 'load', function() {
          expect(Application.current_user_id).to(equal, "billy");
        });
        Application.last_post.simulate_success({
          current_user_id: "billy"
        });
        expect(jQuery.history.load).to(have_been_called);
        expect(jQuery.history.load).to(have_been_called, with_args("elections"));
      });
    });
  });
}});