describe("Views.Layout.OrganizationsMenu", function() {
  var organizationsMenu;
  beforeEach(function() {
    organizationsMenu = attachLayout().organizationsMenu;
    expect(organizationsMenu).toExist();
  });

  describe("showing and hiding the Add Organization link and the dropdown link", function() {
    var singleMembershipUser, multiMembershipUser, org1, org2;

    beforeEach(function() {
      singleMembershipUser = User.createFromRemote({id: 1, guest: false, firstName: "Joe", lastName: "Member", emailHash: 'fake-email-hash'});
      multiMembershipUser = User.createFromRemote({id: 2, guest: false, firstName: "Joe", lastName: "Member", emailHash: 'fake-email-hash'});

      org1 = Organization.createFromRemote({id: 1});
      org2 = Organization.createFromRemote({id: 2});
      singleMembershipUser.memberships().createFromRemote({organizationId: org1.id()});
      multiMembershipUser.memberships().createFromRemote({organizationId: org1.id()});
      multiMembershipUser.memberships().createFromRemote({organizationId: org2.id()});

      expect(singleMembershipUser.organizations().size()).toEqual(1);
      
    });

    it("shows the Add Organizations links when the user is a member of one organization, and shows the dropdown menu link if they have more than one", function() {
      Application.currentUser(singleMembershipUser);

      expect(organizationsMenu.addOrganizationLink).toBeVisible();
      expect(organizationsMenu.dropdownLink).toBeHidden();
      
      Application.currentUser(multiMembershipUser);

      expect(organizationsMenu.addOrganizationLink).toBeHidden();
      expect(organizationsMenu.dropdownLink).toBeVisible();

      Application.currentUser(singleMembershipUser);

      expect(organizationsMenu.addOrganizationLink).toBeVisible();
      expect(organizationsMenu.dropdownLink).toBeHidden();
    });

    it("shows the dropdown link when the user first becomes a member of multiple organizaitons and hides it if they revert back to one", function() {
      expect(singleMembershipUser.organizations().size()).toEqual(1);
      Application.currentUser(singleMembershipUser);

      expect(organizationsMenu.addOrganizationLink).toBeVisible();
      expect(organizationsMenu.dropdownLink).toBeHidden();

      var membership2 = singleMembershipUser.memberships().createFromRemote({organizationId: org2.id()});

      expect(organizationsMenu.addOrganizationLink).toBeHidden();
      expect(organizationsMenu.dropdownLink).toBeVisible();

      membership2.remotelyDestroyed();

      expect(organizationsMenu.addOrganizationLink).toBeVisible();
      expect(organizationsMenu.dropdownLink).toBeHidden();

      Application.currentUser(multiMembershipUser);
      expect(organizationsMenu.userSubscriptions.size()).toEqual(2);
    });
  });
});
