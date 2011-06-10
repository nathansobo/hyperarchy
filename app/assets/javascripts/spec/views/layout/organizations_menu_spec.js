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
      expect(organizationsMenu.dropdownMenu).toBeHidden();
      
      Application.currentUser(multiMembershipUser);

      expect(organizationsMenu.addOrganizationLink).toBeHidden();
      expect(organizationsMenu.dropdownMenu).toBeVisible();

      Application.currentUser(singleMembershipUser);

      expect(organizationsMenu.addOrganizationLink).toBeVisible();
      expect(organizationsMenu.dropdownMenu).toBeHidden();
    });

    it("shows the dropdown menu when the user first becomes a member of multiple organizaitons and hides it if they revert back to one", function() {
      expect(singleMembershipUser.organizations().size()).toEqual(1);
      Application.currentUser(singleMembershipUser);

      expect(organizationsMenu.addOrganizationLink).toBeVisible();
      expect(organizationsMenu.dropdownMenu).toBeHidden();

      var membership2 = singleMembershipUser.memberships().createFromRemote({organizationId: org2.id()});

      expect(organizationsMenu.addOrganizationLink).toBeHidden();
      expect(organizationsMenu.dropdownMenu).toBeVisible();

      membership2.remotelyDestroyed();

      expect(organizationsMenu.addOrganizationLink).toBeVisible();
      expect(organizationsMenu.dropdownMenu).toBeHidden();

      Application.currentUser(multiMembershipUser);
      expect(organizationsMenu.userSubscriptions.size()).toEqual(2);
    });
  });

  describe("when the Add Organization link is clicked", function() {
    it("shows the signup form with the organization name field visible and a relevant title", function() {
      organizationsMenu.addOrganizationLink.click();
      expect(Application.signupForm).toBeVisible();
      expect(Application.signupForm.organizationSection).toBeVisible();
      expect(Application.signupForm.participateHeader).toBeHidden();
      expect(Application.signupForm.addOrganizationHeader).toBeVisible();
    });
  });

  describe("when the dropdown link is clicked", function() {
    describe("when the add organization link is clicked inside the dropdown", function() {
      it("shows the signup form with the organization name field visible and a relevant title", function() {
        organizationsMenu.dropdownMenu.addOrganizationLink.click();
        expect(Application.signupForm).toBeVisible();
        expect(Application.signupForm.organizationSection).toBeVisible();
        expect(Application.signupForm.participateHeader).toBeHidden();
        expect(Application.signupForm.addOrganizationHeader).toBeVisible();
      });
    });
  });
});
