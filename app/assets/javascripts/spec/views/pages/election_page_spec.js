//= require spec/spec_helper

describe("Views.Pages.Election", function() {
  var electionPage;
  beforeEach(function() {
    renderLayout();
    Application.height(700);
    electionPage = Application.electionPage;
    electionPage.show();
  });

  describe("when the params hash is assigned", function() {
    var currentUser, election, candidate1, candidate2, currentUserRanking1, currentUserRanking2;
    var otherUser, otherUser2, electionCommentCreator, candidateCommentCreator, otherUserRanking1, otherUserRanking2;

    beforeEach(function() {
      enableAjax();
      currentUser = login();
      usingBackdoor(function() {
        var electionCreator = User.create();
        election = Election.create();
        election.update({creatorId: electionCreator.id()});
        otherUser = User.create();
        otherUser2 = User.create();
        electionCommentCreator = User.create();
        candidateCommentCreator = User.create();
        currentUser.memberships().create({organizationId: election.organizationId()});
        otherUser.memberships().create({organizationId: election.organizationId()});
        electionCommentCreator.memberships().create({organizationId: election.organizationId()});
        candidateCommentCreator.memberships().create({organizationId: election.organizationId()});
        var electionComment = election.comments().create();
        electionComment.update({creatorId: electionCommentCreator.id()});
        candidate1 = election.candidates().create();
        var candidateComment = candidate1.comments().create();
        candidateComment.update({creatorId: candidateCommentCreator.id()});
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
        expect(election.creator()).toBeDefined();
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
            electionPage.newCandidateLink.hide();
            electionPage.params({ electionId: election.id() }).success(complete);
            expect(electionPage.votes.selectedVoterId()).toBe(Application.currentUserId());

            expect(electionPage.headline).toBeHidden();
            expect(electionPage.columns).toBeHidden();
            expect(electionPage.spinner).toBeVisible();
          });

          runs(function() {
            expectElectionDataFetched();
            expectElectionDataAssigned();

            expect(electionPage.headline).toBeVisible();
            expect(electionPage.columns).toBeVisible();
            expect(electionPage.spinner).toBeHidden();

            expect(electionPage.rankedCandidates.rankings().tuples()).toEqual(election.rankings().where({userId: currentUser.id()}).tuples());
            expect(electionPage.rankedCandidates).toBeVisible();
            expect(electionPage.candidateDetails).not.toHaveClass('active');
            expect(electionPage.votes.selectedVoterId()).toBe(Application.currentUserId());
            expect(electionPage.rankedCandidatesHeader.text()).toBe("Your Ranking");
            expect(electionPage.newCandidateLink).toBeVisible();
          });
        });
      });

      describe("if the voterId is specified", function() {
        it("fetches the election data and the specified voter's rankings before assigning relations to the subviews", function() {
          waitsFor("fetch to complete", function(complete) {
            electionPage.newCandidateLink.hide();
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
            expect(electionPage.newCandidateLink).toBeVisible();
          });
        });
      });

      describe("if the candidateId is specified", function() {
        it("fetches the election data along with the candidate's comments and commenters before assigning relations to the subviews and the selectedCandidate to the currentConsensus and candidateDetails", function() {
          waitsFor("fetch to complete", function(complete) {
            electionPage.newCandidateLink.hide();
            electionPage.params({ electionId: election.id(), candidateId: candidate1.id() }).success(complete);
            expect(electionPage.votes.selectedVoterId()).toBeFalsy();
          });

          runs(function() {
            expectElectionDataFetched();
            expect(candidate1.comments().size()).toBeGreaterThan(0);
            expect(candidate1.commenters().size()).toBe(candidate1.comments().size());

            expectElectionDataAssigned();

            expect(electionPage.currentConsensus.selectedCandidate()).toEqual(candidate1);
            expect(electionPage.candidateDetails.candidate()).toEqual(candidate1);
            expect(electionPage.rankedCandidates).not.toHaveClass('active');
            expect(electionPage.candidateDetails).toBeVisible();
            expect(electionPage.votes.selectedVoterId()).toBeFalsy();
            expect(electionPage.newCandidateLink).toBeVisible();
          });
        });
      });

      describe("if 'new' is specified as the candidateId", function() {
        it("fetches the election data assigning relations to the subviews and showing the candidate details form in 'new' mode", function() {
          spyOn(electionPage.candidateDetails, 'showNewForm');

          waitsFor("fetch to complete", function(complete) {
            expect(electionPage.newCandidateLink).toBeVisible();
            electionPage.params({ electionId: election.id(), candidateId: 'new' }).success(complete);
            expect(electionPage.newCandidateLink).toBeHidden();
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
        it("assigns the election and candidates before fetching additional data, and puts spinners on the ranking and votes", function() {
          synchronously(function() {
            election.fetch();
            election.candidates().fetch();
            User.fetch(election.creatorId());
          });

          waitsFor("fetch to complete", function(complete) {
            electionPage.params({electionId: election.id()}).success(complete);
            expect(Application.currentOrganizationId()).toBe(election.organizationId());
            expect(electionPage.election()).toEqual(election);
            expect(electionPage.currentConsensus.candidates().tuples()).toEqual(election.candidates().tuples());
            expect(electionPage.rankedCandidates.loading()).toBeTruthy();
            expect(electionPage.votes.loading()).toBeTruthy();
            expect(electionPage.comments.loading()).toBeTruthy();
          });

          runs(function() {
            expect(electionPage.rankedCandidates.rankings()).toBeDefined();
            expect(electionPage.rankedCandidates.loading()).toBeFalsy();
            expect(electionPage.votes.loading()).toBeFalsy();
            expect(electionPage.comments.loading()).toBeFalsy();
          })
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
          electionPage.params({ electionId: election.id() }).success(complete);
        });
      });
      
      describe("if no voterId or candidateId is specified", function() {
        it("hides the candidate details and assigns relations to the subviews, shows the current user's rankings and enables sorting", function() {
          waitsFor("fetch to complete", function(complete) {
            electionPage.params({ electionId: election.id(), candidateId: candidate2.id() }).success(complete);
          });

          runs(function() {
            electionPage.params({ electionId: election.id() });

            expect(electionPage.candidateDetails).not.toHaveClass('active');
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
      });

      describe("if the voterId is specified", function() {
        it("fetches the specified voter's rankings in addition to the current user's before assigning relations to the subviews and disables sorting because they won't be the current user", function() {
          waitsFor("fetch to complete", function(complete) {
            electionPage.params({ electionId: election.id(), voterId: otherUser.id() }).success(complete);
            expect(electionPage.rankedCandidatesHeader.text()).toBe(otherUser.fullName() + "'s Ranking");
            expect(electionPage.currentConsensus.selectedCandidate()).toBeFalsy();
            expect(electionPage.rankedCandidates.sortingEnabled()).toBeFalsy();

            expect(electionPage.rankedCandidates.loading()).toBeTruthy();
            expect(electionPage.comments.loading()).toBeFalsy();
            expect(electionPage.votes.loading()).toBeFalsy();
          });

          runs(function() {
            expect(electionPage.rankedCandidates.loading()).toBeFalsy();

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
        it("assigns the selectedCandidate to the currentConsensus and candidateDetails, then fetches the candidates comments and assigns those later", function() {
          waitsFor("comments and commenters to be fetched", function(complete) {
            electionPage.params({ electionId: election.id(), candidateId: candidate1.id() }).success(complete);

            expect(electionPage.candidateDetails.loading()).toBeTruthy();

            expect(electionPage.candidateDetails).toHaveClass('active');
            expect(electionPage.currentConsensus.selectedCandidate()).toEqual(candidate1);
            expect(electionPage.candidateDetails.candidate()).toEqual(candidate1);
            expect(electionPage.votes.selectedVoterId()).toBeFalsy();

            expect(electionPage.rankedCandidates.loading()).toBeFalsy();
            expect(electionPage.comments.loading()).toBeFalsy();
            expect(electionPage.votes.loading()).toBeFalsy();
          });

          runs(function() {
            expect(electionPage.candidateDetails.loading()).toBeFalsy();
            
            expect(candidate1.comments().size()).toBeGreaterThan(0);
            expect(candidate1.commenters().size()).toBe(candidate1.comments().size());
            expect(electionPage.candidateDetails.comments.comments().tuples()).toEqual(candidate1.comments().tuples());
          });
        });
      });
    });

    describe("when the current user subsequently changes", function() {
      describe("when displaying the current user's rankings", function() {
        beforeEach(function() {
          waitsFor("fetch to complete", function(complete) {
            electionPage.params({ electionId: election.id() }).success(complete);
          });
          runs(function() {
            expect(otherUser.rankings().size()).toBe(0);
          });
        });

        it("fetches the new user's rankings and displays them in the ranked candidates view", function() {
          waitsFor("new rankings to be fetched", function(complete) {
            Application.currentUser(otherUser).success(complete);
          });

          runs(function() {
            expect(otherUser.rankings().size()).toBeGreaterThan(0);
            expect(electionPage.rankedCandidates.rankings().tuples()).toEqual(otherUser.rankings().tuples());
          });
        });
      });

      describe("when not displaying the current user's ranking", function() {
        it("fetches the new user's rankings for this election but does not change the view", function() {
          waitsFor("fetching of candidate data", function(complete) {
            electionPage.params({ electionId: election.id(), candidateId: candidate1.id()}).success(complete);
          });
          
          waitsFor("new rankings to be fetched", function(complete) {
            expect(electionPage.candidateDetails).toHaveClass('active');
            Application.currentUser(otherUser).success(complete);
          });

          runs(function() {
            expect(otherUser.rankings().size()).toBeGreaterThan(0);
            expect(electionPage.candidateDetails).toHaveClass('active'); // we don't change the view
          });
        });
      });
    });
  });

  describe("when the 'suggest an answer' button is clicked", function() {
    it("navigates to the url for new candidates for the current election", function() {
      Application.currentUser(User.createFromRemote({id: 1}));
      var election = Election.createFromRemote({id: 1, creatorId: 1, createdAt: 2345});

      electionPage.election(election);
      electionPage.newCandidateLink.click();
      expect(Path.routes.current).toBe(election.url() + "/candidates/new");
    });
  });

  describe("local logic (no fetching)", function() {
    var creator, election, election2, editableByCurrentUser;
    var headlineTextWhenAdjustColumnTopWasCalled;

    beforeEach(function() {
      useFakeServer();
      creator = User.createFromRemote({id: 1, firstName: "animal", lastName: "eater"});
      organization = Organization.createFromRemote({id: 1, name: "Neurotic designers"});
      election = creator.elections().createFromRemote({id: 1, body: 'short body', details: "aoeu!", organizationId: 98, createdAt: 91234, organizationId: organization.id()});
      election2 = creator.elections().createFromRemote({id: 2, body: 'short body', details: "woo!", organizationId: 98, createdAt: 91234});

      editableByCurrentUser = true;
      spyOn(Election.prototype, 'editableByCurrentUser').andCallFake(function() {
        return editableByCurrentUser;
      });

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

    describe("showing and hiding of the edit and destroy buttons", function() {
      describe("when the current user changes", function() {
        it("only shows the edit and destroy buttons if the current user can edit", function() {
          var user1 = User.createFromRemote({id: 101});
          var user2 = User.createFromRemote({id: 102});

          editableByCurrentUser = false;
          Application.currentUser(user1);
          expect(electionPage.editButton).toBeHidden();
          expect(electionPage.destroyButton).toBeHidden();

          editableByCurrentUser = true;
          Application.currentUser(user2);
          expect(electionPage.editButton).toBeVisible();
          expect(electionPage.destroyButton).toBeVisible();
        });
      });

      describe("when an election is assigned", function() {
        it("only shows the edit and destroy buttons if the current user can edit", function() {
          editableByCurrentUser = false;
          electionPage.election(election2);
          expect(electionPage.editButton).toBeHidden();
          expect(electionPage.destroyButton).toBeHidden();

          editableByCurrentUser = true;
          electionPage.election(election);
          expect(electionPage.editButton).toBeVisible();
          expect(electionPage.destroyButton).toBeVisible();
        });
      });
    });

    describe("showing and hiding of the edit fields", function() {
      it("shows the fields populates their vals, and focuses the body when the edit button is clicked and hides the fields when the cancel button is clicked", function() {
        expectFieldsHidden();

        election.remotelyUpdated({details: "and sometimes Y"});

        electionPage.editButton.click();
        expectFieldsVisible();
        expect(electionPage.editableBody[0]).toBe(document.activeElement);

        expect(electionPage.editableBody.val()).toBe(election.body());
        expect(electionPage.editableDetails.val()).toBe(election.details());
        expect(electionPage.charsRemaining.text()).toBe((140 - election.body().length).toString());

        electionPage.canceleditButton.click();
        expectFieldsHidden();
        expectColumnTopCorrectlyAdjusted();
      });

      it("hides the editable fields when the election changes", function() {
        electionPage.editButton.click();
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
        it("shows the details if they aren't blank and hides them otherwise", function() {
          electionPage.editableBody.val("aoeu");
          electionPage.editableDetails.val("");
          electionPage.updateButton.click();
          Server.lastUpdate.simulateSuccess();
          expect(electionPage.details).toBeHidden();

          electionPage.editableDetails.val("aoeuaoeu");
          electionPage.updateButton.click();
          Server.lastUpdate.simulateSuccess();
          expect(electionPage.details).toBeVisible();
        });
      });
    });
    
    describe("when the save is button is clicked", function() {
      var updates;

      beforeEach(function() {
        electionPage.editButton.click();
        updates = {
          body: "Relish",
          details: "That green stuff..."
        }

        electionPage.editableBody.val(updates.body);
        electionPage.editableDetails.val(updates.details);
      });

      describe("if the body is not blank and not too long", function() {
        it("updates the record's body and details on the server and hides the form", function() {
          electionPage.updateButton.click();

          expect(Server.updates.length).toBe(1);

          expect(Server.lastUpdate.dirtyFieldValues).toEqual(updates);
          Server.lastUpdate.simulateSuccess();

          expectFieldsHidden();

          expect(electionPage.body.text()).toBe(updates.body);
          expect(electionPage.details.text()).toBe(updates.details);
        });
      });

      describe("if the body is blank", function() {
        it("does not save the election or hide the fields", function() {
          electionPage.editableBody.val("    ");
          electionPage.updateButton.click();
          expect(Server.updates.length).toBe(0);
          expectFieldsVisible();
        });
      });

      describe("if the body exceeds 140 characters", function() {
        it("does not save the election or hide the fields", function() {
          var longBody = ""
          _.times(141, function() {
            longBody += "X"
          });
          electionPage.editableBody.val(longBody);
          electionPage.updateButton.click();
          expect(Server.updates.length).toBe(0);
          expectFieldsVisible();
        });
      });
    });

    describe("when the destroy button is clicked", function() {
      it("destroys the election if the user confirms the prompt", function() {
        var confirmValue = false;
        spyOn(window, 'confirm').andCallFake(function() {
          return confirmValue;
        });

        electionPage.destroyButton.click();

        expect(window.confirm).toHaveBeenCalled();
        expect(Server.destroys.length).toBe(0);

        window.confirm.reset();
        confirmValue = true;

        electionPage.destroyButton.click();

        expect(window.confirm).toHaveBeenCalled();
        expect(Server.destroys.length).toBe(1);
        expect(Server.lastDestroy.record).toBe(electionPage.election());
      });
    });

    describe("when the election is destroyed", function() {
      describe("when the election page is visible", function() {
        it("navigates back to the current organization page", function() {
          spyOn(Application, 'showPage');
          electionPage.election().remotelyDestroyed();
          expect(Path.routes.current).toBe(Application.currentOrganization().url());
        });
      });

      describe("when the election page is not visible", function() {
        it("does not change the url", function() {
          electionPage.hide();
          spyOn(Application, 'showPage');
          electionPage.election().remotelyDestroyed();
          expect(Application.showPage).not.toHaveBeenCalled();
        });
      });
    });

    describe("when the 'back to questions' link is clicked", function() {
      it("navigates to the election's organization page", function() {
        spyOn(Application, 'showPage');
        electionPage.organizationLink.click();
        expect(Path.routes.current).toBe(organization.url());
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
          electionPage.editButton.click();
          expectColumnTopCorrectlyAdjusted();

          electionPage.editableBody.trigger('elastic');
          expectColumnTopCorrectlyAdjusted();
        });
      });
    })

    describe("adjustment of the comments top position", function() {
      var longDetails = "";
      beforeEach(function() {
        longDetails = "";
        for (var i = 0; i < 10; i++) longDetails += "Bee bee boo boo ";

        spyOn(electionPage.comments, 'enableOrDisableFullHeight');
      });

      describe("when the details and creator div are populated or when the details change", function() {
        it("adjusts comments to fill remaining vertical space", function() {
          expectCommentsToHaveFullHeight();
          election.remotelyUpdated({details: longDetails});
          expectCommentsToHaveFullHeight();
          expect(electionPage.comments.enableOrDisableFullHeight).toHaveBeenCalled();
        });
      });

      describe("when the window is resized", function() {
        it("adjusts comments to fill remaining vertical space", function() {
          Application.width(1000);
          election.remotelyUpdated({details: longDetails});

          Application.width(700);
          $(window).resize();
          expectCommentsToHaveFullHeight();
          expect(electionPage.comments.enableOrDisableFullHeight).toHaveBeenCalled();
        });
      });

      describe("when showing or hiding the editable details", function() {
        it("adjusts comments to fill remaining vertical space", function() {
          electionPage.editButton.click();
          expectCommentsToHaveFullHeight();
          expect(electionPage.comments.enableOrDisableFullHeight).toHaveBeenCalled();
        });
      });

      describe("when elastic is triggered on the or the body editable details", function() {
        it("adjusts comments to fill remaining vertical space", function() {
          electionPage.editButton.click();
          expectCommentsToHaveFullHeight();
          expect(electionPage.comments.enableOrDisableFullHeight).toHaveBeenCalled();

          electionPage.comments.enableOrDisableFullHeight.reset();
          var columnHeightBeforeElastic = electionPage.find('#column1').height();
          electionPage.editableDetails.val(longDetails + longDetails);
          electionPage.editableDetails.keyup();
          expectCommentsToHaveFullHeight(columnHeightBeforeElastic);
          expect(electionPage.comments.enableOrDisableFullHeight).toHaveBeenCalled();

          electionPage.comments.enableOrDisableFullHeight.reset();
          electionPage.editableDetails.val("");
          electionPage.editableDetails.keyup();
          expectCommentsToHaveFullHeight(columnHeightBeforeElastic);
          expect(electionPage.comments.enableOrDisableFullHeight).toHaveBeenCalled();


          electionPage.comments.enableOrDisableFullHeight.reset();
          electionPage.editableBody.val(longDetails);
          electionPage.editableBody.keyup();
          expect(electionPage.comments.enableOrDisableFullHeight).toHaveBeenCalled();
        });
      });

      function expectCommentsToHaveFullHeight(expectedBottom) {
        var commentsBottom = electionPage.comments.position().top + electionPage.comments.height();
        expect(commentsBottom).toBe(expectedBottom || electionPage.find('#column1').height());
      }
    });
  });

  function expectColumnTopCorrectlyAdjusted() {
    expect(electionPage.columns.position().top).toBe(electionPage.columnTopPosition());
  }

  function expectFieldsVisible() {
    expect(electionPage.editableBody).toBeVisible();
    expect(electionPage.editableDetails).toBeVisible();
    expect(electionPage.canceleditButton).toBeVisible();
    expect(electionPage.updateButton).toBeVisible();
    expect(electionPage.editButton).toBeHidden();
    expect(electionPage.body).toBeHidden();
    expect(electionPage.details).toBeHidden();
    expect(electionPage.destroyButton).toBeHidden();
  }

  function expectFieldsHidden() {
    expect(electionPage.editableBody).toBeHidden();
    expect(electionPage.editableDetails).toBeHidden();
    expect(electionPage.canceleditButton).toBeHidden();
    expect(electionPage.updateButton).toBeHidden();
    expect(electionPage.editButton).toBeVisible();
    expect(electionPage.body).toBeVisible();
    expect(electionPage.details).toBeVisible();
  }
});
