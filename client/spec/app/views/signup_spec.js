//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views.Signup", function() {
    use_fake_server();
    
    var view;
    before(function() {
      view = Views.Signup.to_view();
    });

    describe("when #signup_submit is clicked", function() {
      it("posts the form field values to '/users', then calls Application.current_user_id_established with the User's id and navigates to #elections if the result is successful", function() {
        view.find('#full_name').val("Billy Cobham");
        view.find('#email_address').val("cobham@gmail.com");
        view.find('#password').val("spectrum");

        expect(Server.posts).to(be_empty);
        view.find('#signup_submit').click();

        expect(Server.posts.length).to(equal, 1);
        expect(Server.last_post.url).to(equal, "/users");
        expect(Server.last_post.data).to(equal, {
          full_name: "Billy Cobham",
          email_address: "cobham@gmail.com",
          password: "spectrum"
        });

        mock(Application, 'current_user_id_established');
        mock(History, 'load', function() {
          expect(Application.current_user_id_established).to(have_been_called, with_args("billy"));
        });
        Server.last_post.simulate_success({
          current_user_id: "billy"
        });
        expect(History.load).to(have_been_called);
        expect(History.load).to(have_been_called, with_args("elections"));
      });
    });
  });
}});
