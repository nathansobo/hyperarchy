//= require spec/spec_helper

describe("Views.Pages.Election.CandidateLi", function() {
  var candidate, candidateLi;

  beforeEach(function() {
    attachLayout();
    candidate = Candidate.createFromRemote({id: 11, electionId: 22, body: "Fruitloops"});
    candidateLi = Views.Pages.Election.CandidateLi.toView({candidate: candidate});
  });

  describe("when clicked", function() {
    it("navigates to the candidate's url", function() {
      candidateLi.click();
      expect(Path.routes.current).toBe(candidate.url());
    });
  });
});
