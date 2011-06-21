//= require spec/spec_helper

describe("Views.Pages.Election.CurrentConsensus", function() {
  var currentConsensusView, election, candidate1, candidate2;

  beforeEach(function() {
    attachLayout();
    currentConsensusView = Application.electionPage.currentConsensus;
    $('#jasmine_content').append(currentConsensusView);

    election = Election.createFromRemote({id: 1});
    candidate1 = election.candidates().createFromRemote({id: 1, body: "Cheese", position: 1});
    candidate2 = election.candidates().createFromRemote({id: 2, body: "Goats", position: 2});
    currentConsensusView.candidates(election.candidates());
  });

  describe("when the selectedCandidate is changed", function() {
    it("adds the .selected class on the selected candidate's li and removes it from any others", function() {
      currentConsensusView.selectedCandidate(candidate1);
      expect(currentConsensusView).toContain('li.selected:contains("' + candidate1.body() + '")');

      currentConsensusView.selectedCandidate(candidate2);

      expect(currentConsensusView).toContain('li.selected:contains("' + candidate2.body() + '")');
      expect(currentConsensusView).not.toContain('li.selected:contains("' + candidate1.body() + '")');

      currentConsensusView.selectedCandidate(null);
      expect(currentConsensusView).not.toContain('li.selected');
    });
  });

  describe("when the position of a candidate changes", function() {
    it("updates the position on the candidate li", function() {
      var candidate1Li = currentConsensusView.find('li:contains("' + candidate1.body() + '")').view();
      var candidate2Li = currentConsensusView.find('li:contains("' + candidate2.body() + '")').view();

      expect(candidate1Li.position.text()).toBe("1");
      expect(candidate2Li.position.text()).toBe("2");

      candidate1.remotelyUpdated({position: 2});
      candidate2.remotelyUpdated({position: 1});

      expect(candidate1Li.position.text()).toBe("2");
      expect(candidate2Li.position.text()).toBe("1");
    });
  });
});
