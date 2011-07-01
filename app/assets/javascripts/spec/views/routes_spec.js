//= require spec/spec_helper

describe("Routes", function() {
  var defaultGuest, defaultOrganization;
  beforeEach(function() {
    renderLayout();
    defaultOrganization = Organization.createFromRemote({id: 23});
    defaultGuest = User.createFromRemote({id: 1});
    spyOn(defaultGuest, 'defaultOrganization').andReturn(defaultOrganization);
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
});
