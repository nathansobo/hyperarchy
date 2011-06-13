//= require spec/spec_helper

describe("Routes", function() {
  beforeEach(function() {
    renderLayout();
  });

  describe("/organizations/:id", function() {
    it("shows only the organizationPage and assigns the id on it", function() {
      Application.electionPage.show();

      History.pushState(null, null, '/organizations/23');
      expect(Application.electionPage).toBeHidden();
      expect(Application.organizationPage).toBeVisible();
      expect(Application.organizationPage.id()).toBe(23);
    });
  });

  describe("/elections/:id", function() {
    it("shows only the electionsPage and assigns the id on it", function() {
      Application.electionPage.show();
      History.pushState(null, null, '/elections/12');
      expect(Application.organizationPage).toBeHidden();
      expect(Application.electionPage).toBeVisible();
      expect(Application.electionPage.id()).toBe(12);
    });
  });

  describe("/elections/:electionId/candidates/:selectedCandidateId", function() {
    it("shows only the electionsPage and assigns the id and selectedCandidateId on it", function() {
      Application.electionPage.show();
      History.pushState(null, null, '/elections/12/candidates/33');
      expect(Application.organizationPage).toBeHidden();
      expect(Application.electionPage).toBeVisible();
      expect(Application.electionPage.id()).toBe(12);
      expect(Application.electionPage.currentConsensus.selectedCandidateId()).toBe(33);
    });
  });
});
