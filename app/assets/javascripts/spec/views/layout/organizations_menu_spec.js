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

  describe("when the add organization link is clicked inside the dropdown", function() {
    it("shows the signup form with the organization name field visible and a relevant title", function() {
      organizationsMenu.dropdownMenu.addOrganizationLink.click();
      expect(Application.signupForm).toBeVisible();
      expect(Application.signupForm.organizationSection).toBeVisible();
      expect(Application.signupForm.participateHeader).toBeHidden();
      expect(Application.signupForm.addOrganizationHeader).toBeVisible();
    });
  });

  describe("the organizations list in the dropdown menu", function() {
    var u1m1, u2m1, u2m2;

    beforeEach(function() {
      user1 = User.createFromRemote({id: 1});
      user2 = User.createFromRemote({id: 2});
      org1 = Organization.createFromRemote({id: 1, name: "org1"});
      org2 = Organization.createFromRemote({id: 2, name: "org2"});
      u1m1 = user1.memberships().createFromRemote({organizationId: 1});
      u2m1 = user2.memberships().createFromRemote({organizationId: 1});
      u2m2 = user2.memberships().createFromRemote({organizationId: 2});
    });

    it("always contains the current user's organizations", function() {
      Application.currentUser(user1);
      expect(organizationsMenu.dropdownMenu).toContain(":contains('org1')");
      expect(organizationsMenu.dropdownMenu).not.toContain(":contains('org2')");

      Application.currentUser(user2);
      expect(organizationsMenu.dropdownMenu).toContain(":contains('org1')");
      expect(organizationsMenu.dropdownMenu).toContain(":contains('org2')");

      u2m2.remotelyDestroyed();

      expect(organizationsMenu.dropdownMenu).not.toContain(":contains('org2')");

      user2.memberships().createFromRemote({organizationId: 2});

      expect(organizationsMenu.dropdownMenu).toContain(":contains('org2')");
    });
  });
});
