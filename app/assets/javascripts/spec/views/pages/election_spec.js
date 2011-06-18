//= require spec/spec_helper

describe("Views.Pages.Election", function() {
  var electionPage;
  beforeEach(function() {
    attachLayout();
    electionPage = Application.electionPage;
    $('#jasmine_content').html(electionPage);
  });

  describe("when the params hash is assigned", function() {
    var currentUser, election, candidate1, candidate2, currentUserRanking1, currentUserRanking2;
    var otherUser, otherUser2, otherUserRanking1, otherUserRanking2;

    beforeEach(function() {
      enableAjax();
      currentUser = login();
      usingBackdoor(function() {
        election = Election.create();
        otherUser = User.create();
        otherUser.memberships().create({organizationId: election.organizationId()});
        candidate1 = election.candidates().create();
        candidate2 = election.candidates().create();
        currentUserRanking1 = election.rankings().create({userId: currentUser.id(), position: 64, candidateId: candidate1.id()});
        currentUserRanking2 = election.rankings().create({userId: currentUser.id(), position: -64, candidateId: candidate2.id()});
        otherUserRanking1 = election.rankings().create({userId: otherUser.id(), position: 64, candidateId: candidate1.id()});
        otherUserRanking2 = election.rankings().create({userId: otherUser.id(), position: -64, candidateId: candidate2.id()});
      });
      fetchInitialRepositoryContents();
    });

    describe("if the electionId changes", function() {
      describe("if no voterId or candidateId is specified", function() {
        it("fetches the election, candidates, votes, and the the current user's rankings before assigning relations to the subviews", function() {
          waitsFor("fetch to complete", function(complete) {
            electionPage.params({ electionId: election.id() }).success(complete);
          });

          runs(function() {
            expect(Election.find(election.id())).toEqual(election);
            expect(election.candidates().size()).toBe(2);
            expect(election.rankings().size()).toBeGreaterThan(0);
            expect(election.votes().size()).toBeGreaterThan(0);
            expect(election.voters().size()).toBe(election.votes().size());

            expect(electionPage.election()).toEqual(election);
            expect(electionPage.currentConsensus.candidates()).toEqual(election.candidates());
            expect(electionPage.rankedCandidates.rankings().tuples()).toEqual(election.rankings().where({userId: currentUser.id()}).tuples());
            expect(electionPage.rankedCandidates).toBeVisible();
            expect(electionPage.candidateDetails).not.toHaveClass('active');
            expect(electionPage.votes.votes().tuples()).toEqual(election.votes().tuples());
            expect(electionPage.votes.selectedVoterId()).toBeFalsy();
          });
        });
      });

      describe("if the voterId is specified", function() {
        it("fetches the election, candidates, and the the specified voter's rankings before assigning relations to the subviews", function() {
          waitsFor("fetch to complete", function(complete) {
            electionPage.params({ electionId: election.id(), voterId: otherUser.id() }).success(complete);
          });

          runs(function() {
            expect(Election.find(election.id())).toEqual(election);
            expect(election.candidates().size()).toBe(2);
            expect(election.rankings().size()).toBeGreaterThan(0);

            expect(electionPage.election()).toEqual(election);
            expect(electionPage.currentConsensus.candidates()).toEqual(election.candidates());
            expect(electionPage.rankedCandidates.rankings().tuples()).toEqual(election.rankings().where({userId: otherUser.id()}).tuples());
            expect(electionPage.rankedCandidates).toBeVisible();
            expect(electionPage.candidateDetails).not.toHaveClass('active');
            expect(electionPage.votes.votes().tuples()).toEqual(election.votes().tuples());
            expect(electionPage.votes.selectedVoterId()).toEqual(otherUser.id());
          });
        });
      });

      describe("if the candidateId is specified", function() {
        it("fetches the election, and candidates before assigning relations to the subviews and the selectedCandidate to the currentConsensus and candidateDetails", function() {
          waitsFor("fetch to complete", function(complete) {
            electionPage.params({ electionId: election.id(), candidateId: candidate1.id() }).success(complete);
          });

          runs(function() {
            expect(Election.find(election.id())).toEqual(election);
            expect(election.candidates().size()).toBe(2);

            expect(electionPage.election()).toEqual(election);
            expect(electionPage.currentConsensus.candidates()).toEqual(election.candidates());
            expect(electionPage.currentConsensus.selectedCandidate()).toEqual(candidate1);
            expect(electionPage.candidateDetails.candidate()).toEqual(candidate1);
            expect(electionPage.rankedCandidates).not.toHaveClass('active');
            expect(electionPage.candidateDetails).toBeVisible();
            expect(electionPage.votes.selectedVoterId()).toBeFalsy();
          });
        });
      });

      describe("if the election is already present in the repository", function() {
        it("assign the election before fetching additional data", function() {
          synchronously(function() {
            Election.fetch(election.id());
          });

          stubAjax();
          electionPage.params({electionId: election.id()});
          expect(electionPage.election()).toEqual(election);
        });
      });

      describe("if the election does not exist", function() {
        it("navigates to the current user's default organization url", function() {
          waitsFor("fetch to complete", function(complete) {
            electionPage.params({electionId: -27}).success(complete);
          });
          
          runs(function() {
            expect(Path.routes.current).toBe(currentUser.defaultOrganization().url());
          });
        });
      });
    });

    describe("when the electionId does not change", function() {
      beforeEach(function() {
        waitsFor("fetch to complete", function(complete) {
          electionPage.params({ electionId: election.id(), candidateId: candidate2.id() }).success(complete);
        });
      });

      describe("if no voterId or candidateId is specified", function() {
        it("fetches the current user's rankings before assigning relations to the subviews and showing the candidate rankings", function() {
          waitsFor("fetch to complete after no longer assigning a voter id", function(complete) {
            electionPage.params({ electionId: election.id() }).success(complete);
          });

          runs(function() {
            expect(electionPage.rankedCandidates.rankings().tuples()).toEqual(currentUser.rankingsForElection(election).tuples());
            expect(electionPage.rankedCandidates).toBeVisible();
            expect(electionPage.candidateDetails).not.toHaveClass('active');
            expect(electionPage.votes.selectedVoterId()).toBeFalsy();
          });
        });
      });

      describe("if the voterId is specified", function() {
        it("fetches the specified voter's rankings before assigning relations to the subviews", function() {
          waitsFor("fetch to complete", function(complete) {
            electionPage.params({ electionId: election.id(), voterId: otherUser.id() }).success(complete);
          });

          runs(function() {
            expect(electionPage.rankedCandidates.rankings().tuples()).toEqual(otherUser.rankingsForElection(election).tuples());
            expect(electionPage.rankedCandidates).toBeVisible();
            expect(electionPage.candidateDetails).not.toHaveClass('active');
            expect(electionPage.votes.selectedVoterId()).toEqual(otherUser.id());
          });
        });
      });

      describe("if the candidateId is specified", function() {
        it("assigns the selectedCandidate to the currentConsensus and candidateDetails without fetching", function() {
          electionPage.params({ electionId: election.id(), candidateId: candidate1.id() });
          expect(electionPage.rankedCandidates).not.toHaveClass('active');
          expect(electionPage.candidateDetails).toBeVisible();
          expect(electionPage.currentConsensus.selectedCandidate()).toEqual(candidate1);
          expect(electionPage.candidateDetails.candidate()).toEqual(candidate1);
          expect(electionPage.votes.selectedVoterId()).toBeFalsy();
        });
      });
    });
  });

  describe("when the election is assigned", function() {
    var election;

    beforeEach(function() {
      election = Election.createFromRemote({id: 1, body: 'What would jesus & <mary> do?'});
      electionPage.election(election);
    });

    it("assigns the election's body and keeps it up to date when it changes", function() {
      expect(electionPage.body.text()).toEqual(election.body());
      election.remotelyUpdated({body: "what would satan & <damien> do?"});
      expect(electionPage.body.text()).toEqual(election.body());

      var election2 = Election.createFromRemote({id: 2, body: 'Are you my mother?'});
      electionPage.election(election2);
      expect(electionPage.body.text()).toEqual(election2.body());

      election.remotelyUpdated({body: "what would you do for a klondike bar?"});
      expect(electionPage.body.text()).toEqual(election2.body());
    });
  });
});
