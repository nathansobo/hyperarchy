//= require spec/spec_helper

describe("Views.Pages.Election.CurrentConsensus", function() {
  var currentConsensusView, election, candidate1, candidate2;

  beforeEach(function() {
    attachLayout();
    currentConsensusView = Application.electionPage.currentConsensus;
    $('#jasmine_content').append(currentConsensusView);

    election = Election.createFromRemote({id: 1});
    candidate1 = election.candidates().createFromRemote({id: 1, body: "Cheese"});
    candidate2 = election.candidates().createFromRemote({id: 2, body: "Goats"});
    currentConsensusView.candidates(election.candidates());
  });

  describe("when the selectedCandidateId is changed", function() {
    it("adds the .selected class on the selected candidate's li and removes it from any others", function() {
      currentConsensusView.selectedCandidate(candidate1);
      expect(currentConsensusView).toContain('li.selected:contains("' + candidate1.body() + '")');

      currentConsensusView.selectedCandidate(candidate2);

      expect(currentConsensusView).toContain('li.selected:contains("' + candidate2.body() + '")');
      expect(currentConsensusView).not.toContain('li.selected:contains("' + candidate1.body() + '")');
    });
  });
});
