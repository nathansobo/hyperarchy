//= require spec/spec_helper

describe("Views.Pages.Election.CurrentConsensus", function() {
  var currentConsensusView, election, candidate1, candidate2;

  beforeEach(function() {
    attachLayout();
    currentConsensusView = Views.Pages.Election.CurrentConsensus.toView();
    $('#jasmine_content').html(currentConsensusView);

    enableAjax();
    login();
    usingBackdoor(function() {
      election = Election.create();
      createMultiple({
        tableName: 'candidates',
        fieldValues: { electionId: election.id() },
        count: 3
      });

      candidate1 = election.candidates().at(0);
      candidate2 = election.candidates().at(1);
    });

    election.candidates().each(function(candidate) {
      candidate.remotelyDestroyed();
    });
  });

  describe("when the election id is changed", function() {
    it("fetches the candidates for the electio, then assigns the relation on the sorted list", function() {
      waitsFor("candidates to be fetched", function(complete) {
        currentConsensusView.electionId(election.id()).success(complete);
      });

      runs(function() {
        expect(election.candidates().size()).toBe(3);
        expect(_.isEqual(currentConsensusView.list.relation(), election.candidates())).toBeTruthy();
      });
    });
  });

  describe("when the selectedCandidateId is changed", function() {
    describe("if the candidates are not done being fetched", function() {
      it("waits for candidates to be fetched, then adds the .selected class on the selected candidate's li", function() {
        waitsFor("candidates to be fetched", function(complete) {
          var promise = currentConsensusView.electionId(election.id());
          currentConsensusView.selectedCandidateId(candidate1.id());
          expect(currentConsensusView).not.toContain('.selected');
          promise.success(complete);
        });

        runs(function() {
          expect(currentConsensusView).toContain('li.selected:contains("' + candidate1.body() + '")');
        });
      });
    });

    describe("if the candidates have been fetched", function() {
      beforeEach(function() {
        waitsFor("candidates to be fetched", function(complete) {
          currentConsensusView.electionId(election.id()).success(complete);
        });
      });

      it("adds the .selected class on the selected candidate's li and removes it from any others", function() {
        currentConsensusView.selectedCandidateId(candidate1.id());
        expect(currentConsensusView).toContain('li.selected:contains("' + candidate1.body() + '")');

        currentConsensusView.selectedCandidateId(candidate2.id());

        expect(currentConsensusView).toContain('li.selected:contains("' + candidate2.body() + '")');
        expect(currentConsensusView).not.toContain('li.selected:contains("' + candidate1.body() + '")');
      });
    });
  });
});
