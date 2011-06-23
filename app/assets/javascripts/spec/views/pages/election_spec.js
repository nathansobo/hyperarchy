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
    var otherUser, otherUser2, commentCreator, otherUserRanking1, otherUserRanking2;

    beforeEach(function() {
      enableAjax();
      currentUser = login();
      usingBackdoor(function() {
        election = Election.create();
        otherUser = User.create();
        otherUser2 = User.create();
        commentCreator = User.create();
        otherUser.memberships().create({organizationId: election.organizationId()});
        commentCreator.memberships().create({organizationId: election.organizationId()});
        var electionComment = election.comments().create();
        electionComment.update({creatorId: commentCreator.id()});
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
      function expectElectionDataFetched() {
        expect(Election.find(election.id())).toEqual(election);
        expect(election.candidates().size()).toBe(2);
        expect(election.candidates().join(User).on(User.id.eq(Candidate.creatorId)).size()).toBe(2);
        expect(election.rankings().size()).toBeGreaterThan(0);
        expect(election.votes().size()).toBeGreaterThan(0);
        expect(election.voters().size()).toBe(election.votes().size());
        expect(election.comments().size()).toBeGreaterThan(0);
        expect(election.commenters().size()).toBe(election.comments().size());
      }

      function expectElectionDataAssigned() {
        expect(Application.currentOrganizationId()).toBe(election.organizationId());
        expect(electionPage.electionDetails.election()).toEqual(election);
        expect(electionPage.currentConsensus.candidates()).toEqual(election.candidates());
        expect(electionPage.votes.votes().tuples()).toEqual(election.votes().tuples());
        expect(electionPage.electionDetails.comments.comments().tuples()).toEqual(election.comments().tuples());
      }

      describe("if no voterId or candidateId is specified", function() {
        it("fetches the election data before assigning relations to the subviews and the current org id", function() {
          waitsFor("fetch to complete", function(complete) {
            electionPage.params({ electionId: election.id() }).success(complete);
            expect(electionPage.votes.selectedVoterId()).toBe(Application.currentUserId());
          });

          runs(function() {
            expectElectionDataFetched();
            expectElectionDataAssigned();

            expect(electionPage.rankedCandidates.rankings().tuples()).toEqual(election.rankings().where({userId: currentUser.id()}).tuples());
            expect(electionPage.rankedCandidates).toBeVisible();
            expect(electionPage.candidateDetails).not.toHaveClass('active');
            expect(electionPage.votes.selectedVoterId()).toBe(Application.currentUserId());
            expect(electionPage.rankedCandidatesHeader.text()).toBe("Your Ranking");
          });
        });
      });

      describe("if the voterId is specified", function() {
        it("fetches the election data and the specified voter's rankings before assigning relations to the subviews", function() {
          waitsFor("fetch to complete", function(complete) {
            electionPage.params({ electionId: election.id(), voterId: otherUser.id() }).success(complete);
            expect(electionPage.rankedCandidates.sortingEnabled()).toBeFalsy();
            expect(electionPage.votes.selectedVoterId()).toEqual(otherUser.id());
          });

          runs(function() {
            expectElectionDataFetched();
            expectElectionDataAssigned();

            expect(election.rankingsForUser(otherUser).size()).toBeGreaterThan(0);

            expect(electionPage.rankedCandidates.rankings().tuples()).toEqual(election.rankingsForUser(otherUser).tuples());
            expect(electionPage.rankedCandidatesHeader.text()).toBe(otherUser.fullName() + "'s Ranking");
            expect(electionPage.rankedCandidates).toBeVisible();
            expect(electionPage.candidateDetails).not.toHaveClass('active');
          });
        });
      });

      describe("if the candidateId is specified", function() {
        it("fetches the election data before assigning relations to the subviews and the selectedCandidate to the currentConsensus and candidateDetails", function() {
          waitsFor("fetch to complete", function(complete) {
            electionPage.params({ electionId: election.id(), candidateId: candidate1.id() }).success(complete);
            expect(electionPage.votes.selectedVoterId()).toBeFalsy();
          });

          runs(function() {
            expectElectionDataFetched();
            expectElectionDataAssigned();

            expect(electionPage.currentConsensus.selectedCandidate()).toEqual(candidate1);
            expect(electionPage.candidateDetails.candidate()).toEqual(candidate1);
            expect(electionPage.rankedCandidates).not.toHaveClass('active');
            expect(electionPage.candidateDetails).toBeVisible();
            expect(electionPage.votes.selectedVoterId()).toBeFalsy();
          });
        });
      });

      describe("if 'new' is specified as the candidateId", function() {
        it("fetches the election data assigning relations to the subviews and showing the candidate details form in 'new' mode", function() {
          spyOn(electionPage.candidateDetails, 'showNewForm');

          waitsFor("fetch to complete", function(complete) {
            electionPage.params({ electionId: election.id(), candidateId: 'new' }).success(complete);
            expect(electionPage.votes.selectedVoterId()).toBeFalsy();
          });

          runs(function() {
            expectElectionDataFetched();
            expectElectionDataAssigned();

            expect(electionPage.candidateDetails.showNewForm).toHaveBeenCalled();
            expect(electionPage.candidateDetails.candidate()).toBeFalsy();
            expect(electionPage.currentConsensus.selectedCandidate()).toBeFalsy();
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

  describe("when the 'suggest an answer' button is clicked", function() {
    it("navigates to the url for new candidates for the current election", function() {
      Application.currentUser(User.createFromRemote({id: 1}));
      var election = Election.createFromRemote({id: 1, creatorId: 1, createdAt: 2345});

      electionPage.election(election);
      electionPage.newCandidateButton.click();
      expect(Path.routes.current).toBe(election.url() + "/candidates/new");
    });
  });

  describe("adjustment of the columns' top position", function() {
    var creator, election, election2;
    var headlineTextWhenAdjustColumnTopWasCalled;

    beforeEach(function() {
      creator = User.createFromRemote({id: 1, firstName: "animal", lastName: "eater"});
      election = creator.elections().createFromRemote({id: 1, body: 'short body', details: "", organizationId: 98, createdAt: 91234});
      election2 = creator.elections().createFromRemote({id: 2, body: 'short body', details: "", organizationId: 98, createdAt: 91234});

      spyOn(electionPage, 'adjustColumnTop').andCallFake(function() {
        headlineTextWhenAdjustColumnTopWasCalled = electionPage.body.text();
      });
    });

    describe("when the election is assigned", function() {
      it("calls #adjustColumnTop", function() {
        electionPage.election(election);
        expect(electionPage.adjustColumnTop).toHaveBeenCalled();
        expect(headlineTextWhenAdjustColumnTopWasCalled).toBe(election.body());

        electionPage.adjustColumnTop.reset();
        electionPage.election(election2);
        expect(electionPage.adjustColumnTop).toHaveBeenCalled();
        expect(headlineTextWhenAdjustColumnTopWasCalled).toBe(election2.body());
      });

      describe("garbage collection of election subscriptions", function() {
        it("does not leave dangling subscriptions on the previous election when another one is assigned", function() {
          var subCountBefore = election.onUpdateNode.size();
          electionPage.election(election);
          expect(election.onUpdateNode.size()).toBeGreaterThan(subCountBefore);
          electionPage.election(election2);
          expect(election.onUpdateNode.size()).toBe(subCountBefore);
        });
      });
    });

    describe("when the election body changes", function() {
      it("calls #adjustColumnTop after assigning it to the body div", function() {
        electionPage.election(election);
        electionPage.adjustColumnTop.reset();

        election.remotelyUpdated({body: "this is a longer body?"});
        expect(electionPage.adjustColumnTop).toHaveBeenCalled();
        expect(headlineTextWhenAdjustColumnTopWasCalled).toBe("this is a longer body?");
      });
    });
  });
});
