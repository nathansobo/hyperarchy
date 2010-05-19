//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views.Invite", function() {
    var view;
    before(function() {
      view = Views.Invite.toView();
    });

    describe("when the submit button is clicked", function() {
      useFakeServer();
      
      it("submits the email addresses to /invite as JSON, then navigates back to the organization page", function() {
        view.find('textarea').val("steph@example.com\nnath@example.com michelle@example.com,barack@example.com");
        view.find('button').click();

        expect(Server.posts.length).to(eq, 1);
        expect(Server.lastPost.url).to(eq, "/invite")
        expect(Server.lastPost.data).to(equal, {
          email_addresses: ["steph@example.com", "nath@example.com", "michelle@example.com", "barack@example.com"]
        });

        mock(jQuery.bbq, 'pushState');

        Server.lastPost.simulateSuccess();
        expect(jQuery.bbq.pushState).to(haveBeenCalled, withArgs({view: 'organization'}));
        expect(window.notify).to(haveBeenCalled);
      });
    });
  });
}});
