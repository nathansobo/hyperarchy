//= require spec/spec_helper

describe("Candidate", function() {
  describe("#url", function() {
    it("returns the correct url", function() {
      expect(Candidate.createFromRemote({id: 11, electionId: 22, body: "Fruitloops"}).url()).toEqual('/elections/22/candidates/11');
    });
  });
});
