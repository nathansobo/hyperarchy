//= require spec/spec_helper

describe("Views.Pages.Election.CandidateDetails", function() {

  var candidateDetails, candidate;
  beforeEach(function() {
    candidateDetails = Views.Pages.Election.CandidateDetails.toView();
    candidate = Candidate.createFromRemote({id: 1, body: "Mustard.", details: "Pardon me. Do you have any Gray Poupon?"});
  });

  describe("when the candidate is assigned", function() {
    it("populates the body and details divs and keeps them updated", function() {
      candidateDetails.candidate(candidate);
      expect(candidateDetails.body.text()).toEqual(candidate.body());
      expect(candidateDetails.details.text()).toEqual(candidate.details());
      candidate.remotelyUpdated({body: "Catsup", details: "37 flavors"});
      expect(candidateDetails.body.text()).toEqual(candidate.body());
      expect(candidateDetails.details.text()).toEqual(candidate.details());
    });
  });

});
