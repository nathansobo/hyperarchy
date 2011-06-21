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
        otherUser2 = User.create();
        otherUser.memberships().create({organizationId: election.organizationId()});
        candidate1 = election.candidates().create();
        candidate2 = election.candidates().create({creatorId: otherUser2.id()});
        currentUserRanking1 = election.rankings().create({userId: currentUser.id(), position: 64, candidateId: candidate1.id()});
        currentUserRanking2 = election.rankings().create({userId: currentUser.id(), position: -64, candidateId: candidate2.id()});
        otherUserRanking1 = election.rankings().create({userId: otherUser.id(), position: 64, candidateId: candidate1.id()});
        otherUserRanking2 = election.rankings().create({userId: otherUser.id(), position: -64, candidateId: candidate2.id()});
      });
      fetchInitialRepositoryContents();
    });

    describe("if the electionId changes", function() {
      describe("if no voterId or candidateId is specified", function() {
        it("fetches the election, candidates, candidate creators, votes, and the the current user's rankings before assigning relations to the subviews and the current org id", function() {
          waitsFor("fetch to complete", function(complete) {
            electionPage.params({ electionId: election.id() }).success(complete);
            expect(electionPage.votes.selectedVoterId()).toBe(Application.currentUserId());
          });

          runs(function() {
            expect(Election.find(election.id())).toEqual(election);
            expect(election.candidates().size()).toBe(2);
            expect(election.candidates().join(User).on(User.id.eq(Candidate.creatorId)).size()).toBe(2);
            expect(election.rankings().size()).toBeGreaterThan(0);
            expect(election.votes().size()).toBeGreaterThan(0);
            expect(election.voters().size()).toBe(election.votes().size());

            expect(Application.currentOrganizationId()).toBe(election.organizationId());
            expect(electionPage.electionDetails.election()).toEqual(election);
            expect(electionPage.currentConsensus.candidates()).toEqual(election.candidates());
            expect(electionPage.rankedCandidates.rankings().tuples()).toEqual(election.rankings().where({userId: currentUser.id()}).tuples());
            expect(electionPage.rankedCandidates).toBeVisible();
            expect(electionPage.candidateDetails).not.toHaveClass('active');
            expect(electionPage.votes.votes().tuples()).toEqual(election.votes().tuples());
            expect(electionPage.votes.selectedVoterId()).toBe(Application.currentUserId());
            expect(electionPage.rankedCandidatesHeader.text()).toBe("Your Ranking");
          });
        });
      });

      describe("if the voterId is specified", function() {
        it("fetches the election, candidates, and the the specified voter's rankings before assigning relations to the subviews", function() {
          waitsFor("fetch to complete", function(complete) {
            electionPage.params({ electionId: election.id(), voterId: otherUser.id() }).success(complete);
            expect(electionPage.rankedCandidates.sortingEnabled()).toBeFalsy();
            expect(electionPage.votes.selectedVoterId()).toEqual(otherUser.id());
          });

          runs(function() {
            expect(Election.find(election.id())).toEqual(election);
            expect(election.candidates().size()).toBe(2);
            expect(election.rankings().size()).toBeGreaterThan(0);

            expect(Application.currentOrganizationId()).toBe(election.organizationId());
            expect(electionPage.electionDetails.election()).toEqual(election);
            expect(electionPage.currentConsensus.candidates()).toEqual(election.candidates());
            expect(election.candidates().join(User).on(User.id.eq(Candidate.creatorId)).size()).toBe(2);
            expect(electionPage.rankedCandidates.rankings().tuples()).toEqual(election.rankings().where({userId: otherUser.id()}).tuples());
            expect(electionPage.rankedCandidatesHeader.text()).toBe(otherUser.fullName() + "'s Ranking");
            expect(electionPage.rankedCandidates).toBeVisible();
            expect(electionPage.candidateDetails).not.toHaveClass('active');
            expect(electionPage.votes.votes().tuples()).toEqual(election.votes().tuples());
          });
        });
      });

      describe("if the candidateId is specified", function() {
        it("fetches the election, and candidates before assigning relations to the subviews and the selectedCandidate to the currentConsensus and candidateDetails", function() {
          waitsFor("fetch to complete", function(complete) {
            electionPage.params({ electionId: election.id(), candidateId: candidate1.id() }).success(complete);
            expect(electionPage.votes.selectedVoterId()).toBeFalsy();
          });

          runs(function() {
            expect(Election.find(election.id())).toEqual(election);
            expect(election.candidates().size()).toBe(2);

            expect(Application.currentOrganizationId()).toBe(election.organizationId());
            expect(electionPage.electionDetails.election()).toEqual(election);
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
        it("assigns the election before fetching additional data", function() {
          synchronously(function() {
            Election.fetch(election.id());
          });

          stubAjax(); // we still fetch, but we're not testing that in this spec
          electionPage.params({electionId: election.id()});
          expect(Application.currentOrganizationId()).toBe(election.organizationId());
          expect(electionPage.electionDetails.election()).toEqual(election);
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
        it("synchronously assigns relations to the subviews, shows the current user's rankings and enables sorting", function() {
          electionPage.params({ electionId: election.id() });
          expect(electionPage.votes.selectedVoterId()).toBe(Application.currentUserId());
          expect(electionPage.rankedCandidates.rankings().tuples()).toEqual(currentUser.rankingsForElection(election).tuples());
          expect(electionPage.currentConsensus.selectedCandidate()).toBeFalsy();
          expect(electionPage.rankedCandidates.sortingEnabled()).toBeTruthy();
          expect(electionPage.rankedCandidatesHeader.text()).toBe("Your Ranking");
          expect(electionPage.rankedCandidates).toBeVisible();
          expect(electionPage.candidateDetails).not.toHaveClass('active');
          expect(electionPage.votes.selectedVoterId()).toBe(Application.currentUserId());
          expect(electionPage.rankedCandidatesHeader.text()).toBe("Your Ranking");
        });
      });

      describe("if the voterId is specified", function() {
        it("fetches the specified voter's rankings in addition to the current user's before assigning relations to the subviews and disables sorting because they won't be the current user", function() {
          waitsFor("fetch to complete", function(complete) {
            electionPage.params({ electionId: election.id(), voterId: otherUser.id() }).success(complete);
            expect(electionPage.currentConsensus.selectedCandidate()).toBeFalsy();
            expect(electionPage.rankedCandidates.sortingEnabled()).toBeFalsy();
            expect(electionPage.rankedCandidatesHeader.text()).toBe(otherUser.fullName() + "'s Ranking");
          });

          runs(function() {
            expect(currentUser.rankings().size()).toBeGreaterThan(0);
            expect(electionPage.rankedCandidates.rankings().tuples()).toEqual(otherUser.rankingsForElection(election).tuples());
            expect(electionPage.rankedCandidates).toBeVisible();
            expect(electionPage.candidateDetails).not.toHaveClass('active');
            expect(electionPage.votes.selectedVoterId()).toEqual(otherUser.id());
            expect(electionPage.rankedCandidatesHeader.text()).toBe(otherUser.fullName() + "'s Ranking");
          });
        });

        it("still enables sorting on the votes list and sets the correct header if the voter id matches the current user id", function() {
          stubAjax();
          electionPage.params({ electionId: election.id(), voterId: currentUser.id() });
          expect(electionPage.rankedCandidates.sortingEnabled()).toBeTruthy();
          expect(electionPage.rankedCandidatesHeader.text()).toBe('Your Ranking');
        });
      });

      describe("if the candidateId is specified", function() {
        it("assigns the selectedCandidate to the currentConsensus and candidateDetails without fetching", function() {
          electionPage.params({ electionId: election.id(), candidateId: candidate1.id() });
          expect(electionPage.candidateDetails).toHaveClass('active');
          expect(electionPage.currentConsensus.selectedCandidate()).toEqual(candidate1);
          expect(electionPage.candidateDetails.candidate()).toEqual(candidate1);
          expect(electionPage.votes.selectedVoterId()).toBeFalsy();
        });
      });

      describe("if the candidate details are showing (meaning the candidateId was _previously_ specified) and no candidateId is specified now", function() {
        it("hides the candidate details view immediately", function() {
          electionPage.params({ electionId: election.id(), candidateId: candidate1.id() });
          expect(electionPage.candidateDetails).toHaveClass('active');
          electionPage.params({ electionId: election.id() });
          expect(electionPage.candidateDetails).not.toHaveClass('active');
        });
      });
    });
  });
});
