//= require spec/spec_helper

describe("Views.Layout.OrganizationsMenu", function() {
  var organizationsMenu;
  beforeEach(function() {
    organizationsMenu = renderLayout().organizationsMenu;
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
      expect(Application.signupForm).toHaveClass('add-organization');
      expect(Application.signupForm.organizationName[0]).toBe(document.activeElement);
    });
  });

  describe("when the add organization link is clicked inside the dropdown", function() {
    it("shows the signup form with the organization name field visible and a relevant title", function() {
      organizationsMenu.dropdownMenu.addOrganizationLink.click();
      expect(Application.signupForm).toBeVisible();
      expect(Application.signupForm.organizationSection).toBeVisible();
      expect(Application.signupForm.participateHeader).toBeHidden();
      expect(Application.signupForm.addOrganizationHeader).toBeVisible();
      expect(Application.signupForm).toHaveClass('add-organization');
      expect(Application.signupForm.organizationName[0]).toBe(document.activeElement);
    });
  });

  describe("the organizations list in the dropdown menu", function() {
    var u1m1, u2m1, u2m2, org1, org2, user1, user2;

    beforeEach(function() {
      org1 = Organization.createFromRemote({id: 1, name: "org1"});
      user1 = User.createFromRemote({id: 1});
      user2 = User.createFromRemote({id: 2});
      org2 = Organization.createFromRemote({id: 2, name: "org2"});
      u1m1 = user1.memberships().createFromRemote({id: 1, organizationId: org1.id()});
      u2m1 = user2.memberships().createFromRemote({id: 2, organizationId: org1.id(), role: "owner"});
      u2m2 = user2.memberships().createFromRemote({id: 3, organizationId: org2.id()});
    });

    it("always contains the current user's organizations", function() {
      console.debug(Organization.tuples());
      
      Application.currentUser(user1);
      expect(organizationsMenu.dropdownMenu).toContain(":contains('org1')");
      expect(organizationsMenu.dropdownMenu).not.toContain(":contains('org2')");

      Application.currentUser(user2);
      expect(organizationsMenu.dropdownMenu).toContain(":contains('org1')");
      expect(organizationsMenu.dropdownMenu).toContain(":contains('org2')");


      console.debug(user2.organizations().operand.constructor.basename);

      u2m2.remotelyDestroyed();

      expect(organizationsMenu.dropdownMenu).not.toContain(":contains('org2')");

      user2.memberships().createFromRemote({id: 4, organizationId: 2});

      expect(organizationsMenu.dropdownMenu).toContain(":contains('org2')");
    });

    it("navigates to an organization's url when that organization's name is clicked in the dropdown menu", function() {
      Application.currentUser(user1);
      var orgLink = organizationsMenu.dropdownMenu.organizationsList.find("li:contains('org1')");
      expect(orgLink).toExist();
      orgLink.click();
      expect(Path.routes.current).toBe(org1.url());
    });

    it("shows the admin link for only those organizations that the current user owns", function() {
      Application.currentUser(user2);
      organizationsMenu.dropdownMenu.link.click();
      var org1Li = organizationsMenu.dropdownMenu.organizationsList.find("li:contains('org1')").view();
      var org2Li = organizationsMenu.dropdownMenu.organizationsList.find("li:contains('org2')").view();

      expect(org1Li.adminLink).toBeVisible();
      expect(org2Li.adminLink).toBeHidden();

      u2m1.remotelyUpdated({role: "member"});
      u2m2.remotelyUpdated({role: "owner"});

      expect(org1Li.adminLink).toBeHidden();
      expect(org2Li.adminLink).toBeVisible();
    });

    describe("when an admin link is clicked", function() {
      it("navigates to the settings page for that organization", function() {
        Application.currentUser(user2);
        organizationsMenu.dropdownMenu.link.click();
        var org1Li = organizationsMenu.dropdownMenu.organizationsList.find("li:contains('org1')").view();
        expect(org1Li.adminLink).toBeVisible();

        spyOn(Application, 'showPage');
        org1Li.adminLink.click()

        expect(Path.routes.current).toBe(org1.settingsUrl());
      });
    });
  });

});
