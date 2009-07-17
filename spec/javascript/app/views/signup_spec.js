//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views.Signup", function() {
    var view;
    before(function() {
      view = Views.Signup.to_view();
    });

    describe("when #signup_submit is clicked", function() {
      it("posts to the form attributes '/users', and sets the user_id and navigates to #elections if the result is successful", function() {
        mock(Application, 'post');

        view.find('#full_name').val("Billy Cobham");
        view.find('#email_address').val("cobham@gmail.com");
        view.find('#password').val("spectrum");

        view.find('#signup_submit').click();

        expect(Application.post).to(have_been_called, with_args("/users", {
          full_name: "Billy Cobham",
          email_address: "cobham@gmail.com",
          password: "spectrum"
        }));
      });
    });
  });
}});