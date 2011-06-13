//= require spec/spec_helper

describe("Views.Pages.Election.CurrentConsensus", function() {
  var currentConsensusView;

  beforeEach(function() {
    attachLayout();
    currentConsensusView = Views.Pages.Election.CurrentConsensus.toView();
    $('#jasmine_content').html(currentConsensusView);
  });

  describe("when the candidates relation is changed", function() {
    var election;

    beforeEach(function() {
      login();
      usingBackdoor(function() {
        election = Election.create();
        createMultiple({
          tableName: 'candidates',
          fieldValues: { electionId: election.id() },
          count: 3
        });
      });

      election.candidates().each(function(candidate) {
        candidate.remotelyDestroyed();
      });
    });


    it("shows a spinner and fetches the candidates, then assigns the relation on the sorted list", function() {
      waitsFor("candidates to be fetched", function(complete) {
        currentConsensusView.candidates(election.candidates()).success(complete);
      });

      runs(function() {
        expect(currentConsensusView.list.relation()).toBe(election.candidates());
      });
    });
  });
});
