//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views.Signup", function() {
    useFakeServer();
    
    var view;
    before(function() {
      view = Views.Signup.toView();
    });

    describe("when #signupSubmit is clicked", function() {
      it("posts the form field values to '/users', then calls Application.currentUserIdEstablished with the User's id and navigates the organization view if the result is successful", function() {
        view.find('#fullName').val("Billy Cobham");
        view.find('#emailAddress').val("cobham@gmail.com");
        view.find('#password').val("spectrum");

        expect(Server.posts).to(beEmpty);
        view.find('#signupSubmit').click();

        expect(Server.posts.length).to(equal, 1);
        expect(Server.lastPost.url).to(equal, "/users");
        expect(Server.lastPost.data).to(equal, {
          fullName: "Billy Cobham",
          emailAddress: "cobham@gmail.com",
          password: "spectrum"
        });

        mock(Application, 'currentUserIdEstablished');
        mock(History, 'load', function() {
          expect(Application.currentUserIdEstablished).to(haveBeenCalled, withArgs("billy"));
        });
        Server.lastPost.simulateSuccess({
          currentUserId: "billy"
        });
        expect(History.load).to(haveBeenCalled);
        expect(History.load).to(haveBeenCalled, withArgs("organizations"));
      });
    });
  });
}});
