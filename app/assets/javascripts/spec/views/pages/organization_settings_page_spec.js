//= require spec/spec_helper

describe("Views.Pages.OrganizationSettings", function() {
  var settingsPage, org, owner;

  beforeEach(function() {
    attachLayout();
    settingsPage = Application.organizationSettingsPage;
    org = Organization.createFromRemote({id: 2});
    org.makeMember({id: 1});
    org.makeMember({id: 2});
    owner = org.makeOwner({id: 3});

    enableAjax();
    uploadRepository();
    login(owner);
  });

  describe("#params", function() {
    it("fetches the members and memberships of the given organization", function() {
      expect(User.size()).toBe(1);
      expect(Membership.size()).toBe(owner.memberships().size());

      waitsFor("fetch to complete", function(complete) {
        settingsPage.params({organizationId: org.id()}).success(complete);
      });

      runs(function() {
        expect(User.size()).toBe(3);
        expect(Membership.size()).toBeGreaterThan(owner.memberships().size());
      });
    });
  });
});
