//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views.Login", function() {
    useFakeApplicationController();

    var view;
    before(function() {
      view = Views.Login.toView();
    });


    describe("when #loginSubmit is clicked", function() {
      before(function() {
        view.find('#emailAddress').val("cobham@gmail.com");
        view.find('#password').val("spectrum");

        expect(Server.posts).to(beEmpty);
        view.find('#loginSubmit').click();

      });

      it("posts the form field values to /login after underscoring the keys", function() {
        expect(Server.posts.length).to(eq, 1);
        expect(Server.lastPost.url).to(eq, "/login");
        expect(Server.lastPost.data).to(equal, {
          email_address: "cobham@gmail.com",
          password: "spectrum"
        });
      });


      context("when the result is successful", function() {
        it("calls Application.currentUserIdEstablished with the User's id and navigates to the organization view", function() {

          mock(Application, 'currentUserIdEstablished');
          mock(History, 'load', function() {
            expect(Application.currentUserIdEstablished).to(haveBeenCalled, withArgs("billy"));
          });
          Server.lastPost.simulateSuccess({
            currentUserId: "billy"
          });
          expect(History.load).to(haveBeenCalled, withArgs("organizations"));
        });
      })

      context("when the result is unsuccessful", function() {
        it("displays the error and does not set the Application.currentUserId or navigate to #elections", function() {
          mock(History, 'load');
          Server.lastPost.simulateFailure({
            errors: {
              password: "Your password did not match the given email address."
            }
          });
          expect(History.load).toNot(haveBeenCalled);
          expect(view.html()).to(match, "Your password did not match the given email address.");
        });
      })

    });
  });
}});
