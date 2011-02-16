//= require "../../hyperarchy_spec_helper"


Screw.Unit(function(c) { with(c) {
  describe("User", function() {
    describe("#defaultOrganization", function() {
      var socialOrg;
      before(function() {
        socialOrg = Organization.createFromRemote({id: 1, social: true});
      });

      context("when the user is a member", function() {
        it("returns the organization associated with the most recently visited membership", function() {
          var org1 = Organization.createFromRemote({id: 2});
          var org2 = Organization.createFromRemote({id: 3});

          var user = User.createFromRemote({id: 1, guest: false});

          var time = new Date().getTime();

          user.memberships().createFromRemote({id: 1, organizationId: 1, lastVisited: time - 10000});
          user.memberships().createFromRemote({id: 2, organizationId: 2, lastVisited: time - 5000});
          user.memberships().createFromRemote({id: 3, organizationId: 3, lastVisited: time - 1000});

          expect(user.defaultOrganization()).to(eq, org2);
        });
      });

      context("when the user is a guest", function() {
        it("returns the hyperarchy social organization", function() {
          var user = User.createFromRemote({id: 1, guest: true});
          expect(user.defaultOrganization()).to(eq, socialOrg);
        });
      });
    });
  });
}});