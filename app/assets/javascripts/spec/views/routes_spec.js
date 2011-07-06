//= require spec/spec_helper

describe("Routes", function() {
  var member, defaultGuest, defaultOrganization;
  beforeEach(function() {
    renderLayout();
    defaultOrganization = Organization.createFromRemote({id: 23});
    defaultGuest = User.createFromRemote({id: 1, defaultGuest: true, guest: true});
    member = User.createFromRemote({id: 2});
    spyOn(defaultGuest, 'defaultOrganization').andReturn(defaultOrganization);
    spyOn(member, 'defaultOrganization').andReturn(defaultOrganization);
    Application.currentUser(defaultGuest);
  });

  describe("/", function() {
    it("navigates to the current user's default organization page", function() {
      spyOn(_, 'defer').andCallFake(function(fn) {
        fn();
      });
      History.pushState(null, null, '/');
      
      expect(Path.routes.current).toBe(defaultOrganization.url());
      expect(_.defer).toHaveBeenCalled(); // firefox needs this
    });
  });

  describe("/organizations/:id", function() {
    describe("when the organization is present in the local repository", function() {
      it("shows only the organizationPage and assigns the id on it", function() {
        Organization.createFromRemote({id: 23});
        History.pushState(null, null, '/organizations/23');

        expect(Application.electionPage).toBeHidden();
        expect(Application.organizationPage).toBeVisible();
        expect(Application.organizationPage.params()).toEqual({organizationId: 23});
      });
    });
  });

  describe("/elections/:electionId", function() {
    it("shows only the electionsPage, assigns the id on it, and assigns the current user's rankings relation on ranked candidates list", function() {
      Application.electionPage.show();
      History.pushState(null, null, '/elections/12');
      expect(Application.organizationPage).toBeHidden();
      expect(Application.electionPage).toBeVisible();

      expect(Application.electionPage.params()).toEqual({
        electionId: 12
      });
    });
  });

  describe("/elections/:electionId/votes/:voterId", function() {
    it("shows only the electionsPage, assigns the id on it, and assigns the specified user's rankings relation on the ranked candidates list", function() {
      Application.electionPage.show();
      History.pushState(null, null, '/elections/12/votes/29');
      expect(Application.organizationPage).toBeHidden();
      expect(Application.electionPage).toBeVisible();
      expect(Application.electionPage.params()).toEqual({
        electionId: 12,
        voterId: 29
      });
    });
  });

  describe("/elections/:electionId/candidates/new", function() {
    it("shows only the electionsPage assigns the election id, and shows the new candidate form", function() {
      Application.electionPage.show();
      History.pushState(null, null, '/elections/12/candidates/new');
      expect(Application.organizationPage).toBeHidden();
      expect(Application.electionPage).toBeVisible();
      expect(Application.electionPage.params()).toEqual({
        electionId: 12,
        candidateId: 'new'
      });
    });
  });

  describe("/elections/:electionId/candidates/:candidateId", function() {
    it("shows only the electionsPage and assigns the id and selectedCandidateId on it", function() {
      Application.electionPage.show();
      History.pushState(null, null, '/elections/12/candidates/33');
      expect(Application.organizationPage).toBeHidden();
      expect(Application.electionPage).toBeVisible();
      expect(Application.electionPage.params()).toEqual({
        electionId: 12,
        candidateId: 33
      });
    });
  });

  describe("/organizations/:electionId/elections/new", function() {
    it("shows the electionsPage in new mode", function() {
      Application.organizationPage.show();
      History.pushState(null, null, '/organizations/1/elections/new');
      expect(Application.organizationPage).toBeHidden();
      expect(Application.electionPage).toBeVisible();
      expect(Application.electionPage.params()).toEqual({
        organizationId: 1,
        electionId: 'new'
      });
    });
  });

  describe("/account", function() {
    describe("if the current user is not a guest", function() {
      beforeEach(function() {
        Application.currentUser(member);
      });

      it("shows only the accountPage and assigns its user", function() {
        Application.organizationPage.show();
        History.pushState(null, null, '/account');
        expect(Application.organizationPage).toBeHidden();
        expect(Application.accountPage).toBeVisible();
        expect(Application.accountPage.params()).toEqual({userId: member.id()});
      });
    });

    describe("if the current user is a guest", function() {
      describe("if they log in / sign up at the prompt", function() {
        it("shows the account page and assigns its params", function() {
          Application.organizationPage.show();
          History.pushState(null, null, '/account');
          expect(Application.organizationPage).toBeVisible();

          expect(Application.loginForm).toBeVisible();
          Application.loginForm.emailAddress.val("dude@example.com");
          Application.loginForm.password.val("wicked");
          Application.loginForm.form.submit();
          expect($.ajax).toHaveBeenCalled();
          simulateAjaxSuccess({ current_user_id: member.id() });

          expect(Application.organizationPage).toBeHidden();
          expect(Application.accountPage).toBeVisible();
          expect(Application.accountPage.params()).toEqual({userId: member.id()});
        });
      });

      describe("if they cancel at the prompt", function() {
        it("navigates them to their default organization", function() {
          Application.organizationPage.show();
          History.pushState(null, null, '/account');
          expect(Application.organizationPage).toBeVisible();

          expect(Application.loginForm).toBeVisible();
          spyOn(Application, 'showPage');
          Application.loginForm.close();

          expect(Path.routes.current).toBe(defaultGuest.defaultOrganization().url());
        });
      });
    });
  });
});
