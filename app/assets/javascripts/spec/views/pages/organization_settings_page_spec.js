//= require spec/spec_helper

describe("Views.Pages.OrganizationSettings", function() {
  var settingsPage, org, owner, member1, member2;

  beforeEach(function() {
    renderLayout();
    settingsPage = Application.organizationSettingsPage.show();
    org = Organization.createFromRemote({id: 2, name: "ProPublica", privacy: "public"});
    member1 = org.makeMember({id: 1, guest: false});
    member2 = org.makeMember({id: 2, guest: false});
    org.makeMember({id: 3, guest: true});
    owner = org.makeOwner({id: 3});
  });

  describe("fetch logic", function() {
    describe("#params", function() {
      it("assigns the memberships to the list after fetching the members and memberships of the given organization", function() {
        enableAjax();
        uploadRepository();
        login(owner);

        expect(User.size()).toBe(1);
        expect(Membership.size()).toBe(owner.memberships().size());

        waitsFor("fetch to complete", function(complete) {
          settingsPage.params({organizationId: org.id()}).success(complete);
        });

        runs(function() {
          expect(User.size()).toBe(3);
          expect(Membership.size()).toBeGreaterThan(owner.memberships().size());
          expect(settingsPage.memberships.relation().tuples()).toEqual(org.memberships().joinTo(User.where({guest: false})).project(Membership).tuples());
        });
      });
    });
  });

  describe("local logic (no fetching)", function() {
    beforeEach(function() {
      useFakeServer();
      settingsPage.params({organizationId: org.id()});
      Server.lastFetch.simulateSuccess();
    });

    describe("#params", function() {
      // also fetches, see above
      it("populates the organization name field and privacy setting", function() {
        expect(settingsPage.name.val()).toBe(org.name());
        expect(settingsPage.privacy.val()).toBe(org.privacy());
      });

      it("assigns the current organization id on the layout", function() {
        expect(Application.currentOrganization()).toBe(org);
      });

      it("does not include guests in the members list", function() {
        expect(settingsPage.memberships.relation().joinTo(User).where({guest: true}).size()).toBe(0);
      });
    });

    describe("when the fields are changed", function() {
      it("enables the save button if the fields differ from the original values", function() {
        expect(settingsPage.updateButton).toMatchSelector(':disabled');

        settingsPage.name.val("Geothermal");
        settingsPage.name.keyup();
        expect(settingsPage.updateButton).not.toMatchSelector(':disabled');

        settingsPage.name.val(org.name());
        settingsPage.name.keyup();
        expect(settingsPage.updateButton).toMatchSelector(':disabled');

        settingsPage.privacy.val('private');
        settingsPage.privacy.change();
        expect(settingsPage.updateButton).not.toMatchSelector(':disabled');

        settingsPage.privacy.val(org.privacy());
        settingsPage.privacy.change();
        expect(settingsPage.updateButton).toMatchSelector(':disabled');
      });
    });

    describe("when the update button is clicked", function() {
      it("saves the model and disables the save button again", function() {
        useFakeServer();

        settingsPage.name.val("Private Eyes");
        settingsPage.privacy.val('private');
        settingsPage.privacy.change();

        expect(settingsPage.updateButton).not.toMatchSelector(':disabled');

        settingsPage.updateButton.click();

        expect(Server.updates.length).toBe(1);
        Server.lastUpdate.simulateSuccess();

        expect(org.name()).toBe("Private Eyes");
        expect(org.privacy()).toBe('private');

        expect(settingsPage.updateButton).toMatchSelector(':disabled');
      });
    });

    describe("membership lis", function() {
      var membership1, membership1Li;
      beforeEach(function() {
        membership1 = org.membershipForUser(member1);
        membership1Li = settingsPage.memberships.elementForRecord(membership1);
        expect(membership1Li).toExist();
      });

      describe("when the role of a membership is changed", function() {
        it("updates the membership", function() {
          membership1Li.role.val("owner");
          membership1Li.role.change();
          expect(Server.updates.length).toBe(1);
          Server.lastUpdate.simulateSuccess();
          expect(membership1.role()).toBe("owner");
        });
      });

      describe("when the destroy button on a membership li is clicked", function() {
        it("destroys the membership", function() {
          membership1Li.destroyButton.click();
          expect(Server.destroys.length).toBe(1);
          expect(Server.lastDestroy.record).toBe(membership1);
        });
      });
    });

    describe("the invite link", function() {
      it("shows the invite form when clicked", function() {
        settingsPage.inviteLink.click();
        expect(Application.inviteBox).toBeVisible();
      });
    });
  });
});
