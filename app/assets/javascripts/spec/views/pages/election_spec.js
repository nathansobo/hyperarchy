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
        expect(electionPage.election()).toEqual(election);
        expect(electionPage.currentConsensus.candidates()).toEqual(election.candidates());
        expect(electionPage.votes.votes().tuples()).toEqual(election.votes().tuples());
        expect(electionPage.comments.comments().tuples()).toEqual(election.comments().tuples());
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

  describe("local logic (no fetching)", function() {
    var creator, election, election2;
    var headlineTextWhenAdjustColumnTopWasCalled;

    beforeEach(function() {
      creator = User.createFromRemote({id: 1, firstName: "animal", lastName: "eater"});
      election = creator.elections().createFromRemote({id: 1, body: 'short body', details: "aoeu!", organizationId: 98, createdAt: 91234});
      election2 = creator.elections().createFromRemote({id: 2, body: 'short body', details: "woo!", organizationId: 98, createdAt: 91234});

      electionPage.election(election);
    });

    describe("when an election is assigned", function() {
      it("assigns the election's body, details, avatar, and comments relation, and keeps the body and details up to date when they change", function() {
        expect(electionPage.body.text()).toEqual(election.body());
        expect(electionPage.details.text()).toEqual(election.details());
        election.remotelyUpdated({body: "what would satan & <damien> do?", details: "Isdf"});
        expect(electionPage.body.text()).toEqual(election.body());
        expect(electionPage.details.text()).toEqual(election.details());
        expect(electionPage.avatar.user()).toBe(election.creator());
        expect(electionPage.creatorName.text()).toBe(election.creator().fullName());
        expect(electionPage.createdAt.text()).toBe(election.formattedCreatedAt());
        expect(electionPage.comments.comments()).toBe(election.comments());

        electionPage.election(election2);
        expect(electionPage.body.text()).toEqual(election2.body());
        expect(electionPage.details.text()).toEqual(election2.details());

        election.remotelyUpdated({body: "what would you do for a klondike bar?", details: "jhjyg"});
        expect(electionPage.body.text()).toEqual(election2.body());
        expect(electionPage.details.text()).toEqual(election2.details());
      });

      it("does not leave dangling subscriptions on the previous election when another one is assigned", function() {
        var subCountBefore = election2.onUpdateNode.size();
        electionPage.election(election2);
        expect(election2.onUpdateNode.size()).toBeGreaterThan(subCountBefore);
        electionPage.election(election);
        expect(election2.onUpdateNode.size()).toBe(subCountBefore);
      });
    });
    
    describe("showing and hiding of the edit fields", function() {
      it("shows the fields populates their vals, and focuses the body when the edit button is clicked and hides the fields when the cancel button is clicked", function() {
        expectFieldsHidden();

        election.remotelyUpdated({details: "and sometimes Y"});

        electionPage.editLink.click();
        expectFieldsVisible();
        expect(electionPage.editableBody[0]).toBe(document.activeElement);

        expect(electionPage.editableBody.val()).toBe(election.body());
        expect(electionPage.editableDetails.val()).toBe(election.details());

        electionPage.cancelEditLink.click();
        expectFieldsHidden();
        expectColumnTopCorrectlyAdjusted();
      });

      it("hides the editable fields when the election changes", function() {
        electionPage.editLink.click();
        expectFieldsVisible();

        electionPage.election(election2);
        expectFieldsHidden();
      });
    });
    
    describe("showing and hiding of the details", function() {
      describe("when an election is assigned", function() {
        it("shows the details if they aren't blank and hides them otherwise", function() {
          election2.remotelyUpdated({details: ""});

          electionPage.election(election2);

          expect(electionPage.details).toBeHidden();

          expect(election.details()).not.toBe("");
          electionPage.election(election);

          expect(electionPage.details).toBeVisible();
        });
      });

      describe("when the details are updated", function() {
        beforeEach(function() {
          useFakeServer();
        });

        it("shows the details if they aren't blank and hides them otherwise", function() {
          electionPage.editableDetails.val("");
          electionPage.updateLink.click();
          Server.lastUpdate.simulateSuccess();
          expect(electionPage.details).toBeHidden();

          electionPage.editableDetails.val("aoeuaoeu");
          electionPage.updateLink.click();
          Server.lastUpdate.simulateSuccess();
          expect(electionPage.details).toBeVisible();
        });
      });
    });
    
    describe("when the save is button is clicked", function() {
      var updates;

      beforeEach(function() {
        useFakeServer();
        electionPage.editLink.click();
        updates = {
          body: "Relish",
          details: "That green stuff..."
        }

        electionPage.editableBody.val(updates.body);
        electionPage.editableDetails.val(updates.details);
      });

      it("updates the record's body and details on the server and hides the form", function() {
        electionPage.updateLink.click();

        expect(Server.updates.length).toBe(1);

        expect(Server.lastUpdate.dirtyFieldValues).toEqual(updates);
        Server.lastUpdate.simulateSuccess();

        expectFieldsHidden();

        expect(electionPage.body.text()).toBe(updates.body);
        expect(electionPage.details.text()).toBe(updates.details);
      });
    });
    
    describe("adjustment of the columns' top position", function() {
      beforeEach(function() {
        electionPage.election(election);
      });

      describe("when the election is assigned", function() {
        it("calls #adjustColumnTop", function() {
          electionPage.election(election2);
          expectColumnTopCorrectlyAdjusted();

          electionPage.election(election);
          expectColumnTopCorrectlyAdjusted();
        });
      });

      describe("when the election body changes", function() {
        it("calls #adjustColumnTop after assigning it to the body div", function() {
          election.remotelyUpdated({body: "this is a longer body?"});
          expectColumnTopCorrectlyAdjusted();
        });
      });

      describe("when the edit button is clicked or the elastic textarea resizes", function() {
        it("calls #adjustColumnTop after assigning it to the body div", function() {
          electionPage.editLink.click();
          expectColumnTopCorrectlyAdjusted();

          electionPage.editableBody.trigger('elastic');
          expectColumnTopCorrectlyAdjusted();
        });
      });
    })
  });

  function expectColumnTopCorrectlyAdjusted() {
    expect(electionPage.columns.offset().top).toBe(electionPage.distanceFromHeadline() + electionPage.headline.height());
  }

  function expectFieldsVisible() {
    expect(electionPage.editableBody).toBeVisible();
    expect(electionPage.editableDetails).toBeVisible();
    expect(electionPage.cancelEditLink).toBeVisible();
    expect(electionPage.updateLink).toBeVisible();
    expect(electionPage.editLink).toBeHidden();
    expect(electionPage.body).toBeHidden();
    expect(electionPage.details).toBeHidden();
  }

  function expectFieldsHidden() {
    expect(electionPage.editableBody).toBeHidden();
    expect(electionPage.editableDetails).toBeHidden();
    expect(electionPage.cancelEditLink).toBeHidden();
    expect(electionPage.updateLink).toBeHidden();
    expect(electionPage.editLink).toBeVisible();
    expect(electionPage.body).toBeVisible();
    expect(electionPage.details).toBeVisible();
  }
});
