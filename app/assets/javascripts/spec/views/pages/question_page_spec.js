//= require spec/spec_helper

describe("Views.Pages.Question", function() {
  var questionPage;
  beforeEach(function() {
    renderLayout();
    Application.height(700);
    questionPage = Application.questionPage;
    questionPage.show();
  });

  describe("when the params hash is assigned", function() {
    var currentUser, question, answer1, answer2, currentUserRanking1, currentUserRanking2;
    var otherUser, otherUser2, questionCommentCreator, answerCommentCreator, otherUserRanking1, otherUserRanking2;

    beforeEach(function() {
      enableAjax();
      currentUser = login();
      usingBackdoor(function() {
        var questionCreator = User.create();
        var organization = Organization.create({privacy: "public"});
        organization.memberships().create({userId: Application.currentUserId()});
        question = organization.questions().create();
        question.update({creatorId: questionCreator.id()});
        otherUser = User.create();
        otherUser2 = User.create();
        questionCommentCreator = User.create();
        answerCommentCreator = User.create();
        currentUser.memberships().create({organizationId: question.organizationId()});
        otherUser.memberships().create({organizationId: question.organizationId()});
        questionCommentCreator.memberships().create({organizationId: question.organizationId()});
        answerCommentCreator.memberships().create({organizationId: question.organizationId()});
        var questionComment = question.comments().create();
        questionComment.update({creatorId: questionCommentCreator.id()});
        answer1 = question.answers().create();
        var answerComment = answer1.comments().create();
        answerComment.update({creatorId: answerCommentCreator.id()});
        answer2 = question.answers().create({creatorId: otherUser2.id()});
        currentUserRanking1 = question.rankings().create({userId: currentUser.id(), position: 64, answerId: answer1.id()});
        currentUserRanking2 = question.rankings().create({userId: currentUser.id(), position: -64, answerId: answer2.id()});
        otherUserRanking1 = question.rankings().create({userId: otherUser.id(), position: 64, answerId: answer1.id()});
        otherUserRanking2 = question.rankings().create({userId: otherUser.id(), position: -64, answerId: answer2.id()});
      });
      fetchInitialRepositoryContents();
    });

    describe("if the questionId changes", function() {
      function expectQuestionDataFetched() {
        expect(Question.find(question.id())).toEqual(question);
        expect(question.creator()).toBeDefined();
        expect(question.answers().size()).toBe(2);
        expect(question.answers().join(User).on(User.id.eq(Answer.creatorId)).size()).toBe(2);
        expect(question.rankings().size()).toBeGreaterThan(0);
        expect(question.votes().size()).toBeGreaterThan(0);
        expect(question.voters().size()).toBe(question.votes().size());
        expect(question.comments().size()).toBeGreaterThan(0);
        expect(question.commenters().size()).toBe(question.comments().size());
      }

      function expectQuestionDataAssigned() {
        expect(Application.currentOrganizationId()).toBe(question.organizationId());
        expect(questionPage.question()).toEqual(question);
        expect(questionPage.currentConsensus.answers()).toEqual(question.answers());
        expect(questionPage.votes.votes().tuples()).toEqual(question.votes().tuples());
        expect(questionPage.comments.comments().tuples()).toEqual(question.comments().tuples());
      }

      describe("if no voterId or answerId is specified", function() {
        it("fetches the question data before assigning relations to the subviews and the current org id", function() {
          waitsFor("fetch to complete", function(complete) {
            questionPage.params({ questionId: question.id() }).success(complete);
            expect(questionPage.votes.selectedVoterId()).toBe(Application.currentUserId());

            expect(questionPage.headline).toBeHidden();
            expect(questionPage.columns).toBeHidden();
            expect(questionPage.spinner).toBeVisible();
          });

          runs(function() {
            expectQuestionDataFetched();
            expectQuestionDataAssigned();

            expect(questionPage.headline).toBeVisible();
            expect(questionPage.columns).toBeVisible();
            expect(questionPage.spinner).toBeHidden();

            expect(questionPage.rankedAnswers.rankings().tuples()).toEqual(question.rankings().where({userId: currentUser.id()}).tuples());
            expect(questionPage.rankedAnswers).toBeVisible();
            expect(questionPage.answerDetails).not.toHaveClass('active');
            expect(questionPage.votes.selectedVoterId()).toBe(Application.currentUserId());
            expect(questionPage.rankedAnswersHeader.text()).toBe("Your Ranking");
            expect(questionPage.newAnswerLink).not.toHaveClass('active');
            expect(questionPage.backLink).toBeHidden();
          });
        });
      });

      describe("if the voterId is specified", function() {
        it("fetches the question data and the specified voter's rankings before assigning relations to the subviews", function() {
          waitsFor("fetch to complete", function(complete) {
            questionPage.params({ questionId: question.id(), voterId: otherUser.id() }).success(complete);
            expect(questionPage.rankedAnswers.sortingEnabled()).toBeFalsy();
            expect(questionPage.votes.selectedVoterId()).toEqual(otherUser.id());
          });

          runs(function() {
            expectQuestionDataFetched();
            expectQuestionDataAssigned();

            expect(question.rankingsForUser(otherUser).size()).toBeGreaterThan(0);

            expect(questionPage.rankedAnswers.rankings().tuples()).toEqual(question.rankingsForUser(otherUser).tuples());
            expect(questionPage.rankedAnswersHeader.text()).toBe(otherUser.fullName() + "'s Ranking");
            expect(questionPage.rankedAnswers).toBeVisible();
            expect(questionPage.answerDetails).not.toHaveClass('active');
            expect(questionPage.newAnswerLink).not.toHaveClass('active');
            expect(questionPage.backLink).toBeVisible();
          });
        });
      });

      describe("if the answerId is specified", function() {
        describe("if the answer exists", function() {
          it("fetches the question data along with the answer's comments and commenters before assigning relations to the subviews and the selectedAnswer to the currentConsensus and answerDetails", function() {
            waitsFor("fetch to complete", function(complete) {
              questionPage.params({ questionId: question.id(), answerId: answer1.id() }).success(complete);
              expect(questionPage.votes.selectedVoterId()).toBeFalsy();
            });

            runs(function() {
              expectQuestionDataFetched();
              expect(answer1.comments().size()).toBeGreaterThan(0);
              expect(answer1.commenters().size()).toBe(answer1.comments().size());

              expectQuestionDataAssigned();

              expect(questionPage.currentConsensus.selectedAnswer()).toEqual(answer1);
              expect(questionPage.answerDetails.answer()).toEqual(answer1);
              expect(questionPage.rankedAnswers).not.toHaveClass('active');
              expect(questionPage.answerDetails).toBeVisible();
              expect(questionPage.votes.selectedVoterId()).toBeFalsy();
              expect(questionPage.newAnswerLink).not.toHaveClass('active');
              expect(questionPage.backLink).toBeVisible();
            });
          });
        });

        describe("if the answer does NOT exist", function() {
          it("navigates to the current user's ranking", function() {
            beforeEach(function() {
              spyOn(Application, 'showPage');
            });

            waitsFor("fetch to complete", function(complete) {
              var nonExistentAnswerId = 1029341234;
              questionPage.params({ questionId: question.id(), answerId: nonExistentAnswerId }).success(complete);
            });

            runs(function() {
              expect(Path.routes.current).toBe(question.url());
            });
          });
        });
      });

      describe("if 'new' is specified as the answerId", function() {
        it("fetches the question data assigning relations to the subviews and showing the answer details form in 'new' mode", function() {

          waitsFor("fetch to complete", function(complete) {
            expect(questionPage.newAnswerLink).not.toHaveClass('active');
            questionPage.params({ questionId: question.id(), answerId: 'new' }).success(complete);
            expect(questionPage.newAnswerLink).toHaveClass('active');
            expect(questionPage.votes.selectedVoterId()).toBeFalsy();
          });

          runs(function() {
            expectQuestionDataFetched();
            expectQuestionDataAssigned();

            expect(questionPage.answerDetails).toHaveClass('active');
            expect(questionPage.answerDetails.form).toBeVisible();
            expect(questionPage.answerDetails.answer()).toBeFalsy();
            expect(questionPage.currentConsensus.selectedAnswer()).toBeFalsy();
            expect(questionPage.votes.selectedVoterId()).toBeFalsy();
            expect(questionPage.backLink).toBeVisible();

            // now the new answer link actually submits the answer instead of showing the form
            expect(questionPage.newAnswerLink).toHaveClass('active');
            useFakeServer();

            questionPage.answerDetails.editableBody.val("Answer Body");

            questionPage.newAnswerLink.click();
            expect(Server.creates.length).toBe(1);
            expect(Server.lastCreate.record.body()).toBe("Answer Body");
            Server.lastCreate.simulateSuccess({creatorId: Application.currentUser().id()});

            expect(Path.routes.current).toBe(question.url());
          });
        });
      });

      describe("if the fullScreen param is true", function() {
        describe("if no answerId is specified", function() {
          it("shows the full screen consensus after fetching data", function() {
            waitsFor("fetch to complete", function(complete) {
              questionPage.params({ questionId: question.id(), fullScreen: true }).success(complete);
            });

            runs(function() {
              expectQuestionDataFetched();
              expectQuestionDataAssigned();

              expect(Application.fullScreenConsensus).toBeVisible();
              expect(Application.fullScreenConsensus.question()).toEqual(question);
            });
          });
        });

        describe("if an answerId is specified", function() {
          it("shows the full screen consensus after fetching data", function() {
            waitsFor("fetch to complete", function(complete) {
              questionPage.params({ questionId: question.id(), answerId: answer1.id(), fullScreen: true }).success(complete);
            });

            runs(function() {
              expectQuestionDataFetched();
              expectQuestionDataAssigned();

              expect(Application.fullScreenAnswer).toBeVisible();
              expect(Application.fullScreenAnswer.answer()).toEqual(answer1);
              expect(Application.fullScreenAnswer.answer()).toEqual(answer1);
            });
          });

        });
      });

      describe("if the question is already present in the repository", function() {
        it("assigns the question and answers before fetching additional data, and puts spinners on the ranking and votes", function() {
          synchronously(function() {
            question.fetch();
            question.answers().fetch();
            User.fetch(question.creatorId());
          });

          waitsFor("fetch to complete", function(complete) {
            questionPage.params({questionId: question.id()}).success(complete);
            expect(Application.currentOrganizationId()).toBe(question.organizationId());
            expect(questionPage.question()).toEqual(question);
            expect(questionPage.currentConsensus.answers().tuples()).toEqual(question.answers().tuples());
            expect(questionPage.rankedAnswers.loading()).toBeTruthy();
            expect(questionPage.votes.loading()).toBeTruthy();
            expect(questionPage.comments.loading()).toBeTruthy();
          });

          runs(function() {
            expect(questionPage.rankedAnswers.rankings()).toBeDefined();
            expect(questionPage.rankedAnswers.loading()).toBeFalsy();
            expect(questionPage.votes.loading()).toBeFalsy();
            expect(questionPage.comments.loading()).toBeFalsy();
          })
        });
      });

      describe("if the question does not exist", function() {
        it("navigates to the current user's default organization url", function() {
          waitsFor("fetch to complete", function(complete) {
            questionPage.params({questionId: -27}).success(complete);
          });

          runs(function() {
            expect(Path.routes.current).toBe(currentUser.defaultOrganization().url());
          });
        });
      });
    });

    describe("when the questionId does not change", function() {
      beforeEach(function() {
        waitsFor("fetch to complete", function(complete) {
          questionPage.params({ questionId: question.id() }).success(complete);
        });
      });

      describe("if no voterId or answerId is specified", function() {
        it("hides the answer details and assigns relations to the subviews, shows the current user's rankings and enables sorting", function() {
          waitsFor("fetch to complete", function(complete) {
            questionPage.params({ questionId: question.id(), answerId: answer2.id() }).success(complete);
          });

          runs(function() {
            questionPage.params({ questionId: question.id() });

            expect(questionPage.answerDetails).not.toHaveClass('active');
            expect(questionPage.votes.selectedVoterId()).toBe(Application.currentUserId());
            expect(questionPage.rankedAnswers.rankings().tuples()).toEqual(currentUser.rankingsForQuestion(question).tuples());
            expect(questionPage.currentConsensus.selectedAnswer()).toBeFalsy();
            expect(questionPage.rankedAnswers.sortingEnabled()).toBeTruthy();
            expect(questionPage.rankedAnswersHeader.text()).toBe("Your Ranking");
            expect(questionPage.rankedAnswers).toBeVisible();
            expect(questionPage.answerDetails).not.toHaveClass('active');
            expect(questionPage.votes.selectedVoterId()).toBe(Application.currentUserId());
            expect(questionPage.rankedAnswersHeader.text()).toBe("Your Ranking");
            expect(questionPage.backLink).toBeHidden();
          });
        });
      });

      describe("if the voterId is specified", function() {
        it("fetches the specified voter's rankings in addition to the current user's before assigning relations to the subviews and disables sorting because they won't be the current user", function() {
          waitsFor("fetch to complete", function(complete) {
            questionPage.params({ questionId: question.id(), voterId: otherUser.id() }).success(complete);
            expect(questionPage.rankedAnswersHeader.text()).toBe(otherUser.fullName() + "'s Ranking");
            expect(questionPage.currentConsensus.selectedAnswer()).toBeFalsy();
            expect(questionPage.rankedAnswers.sortingEnabled()).toBeFalsy();

            expect(questionPage.rankedAnswers.loading()).toBeTruthy();
            expect(questionPage.comments.loading()).toBeFalsy();
            expect(questionPage.votes.loading()).toBeFalsy();
          });

          runs(function() {
            expect(questionPage.rankedAnswers.loading()).toBeFalsy();

            expect(currentUser.rankings().size()).toBeGreaterThan(0);
            expect(questionPage.rankedAnswers.rankings().tuples()).toEqual(otherUser.rankingsForQuestion(question).tuples());
            expect(questionPage.rankedAnswers).toBeVisible();
            expect(questionPage.answerDetails).not.toHaveClass('active');
            expect(questionPage.votes.selectedVoterId()).toEqual(otherUser.id());
            expect(questionPage.rankedAnswersHeader.text()).toBe(otherUser.fullName() + "'s Ranking");
            expect(questionPage.backLink).toBeVisible();
          });
        });

        it("still enables sorting on the votes list and sets the correct header if the voter id matches the current user id", function() {
          stubAjax();
          questionPage.params({ questionId: question.id(), voterId: currentUser.id() });
          expect(questionPage.rankedAnswers.sortingEnabled()).toBeTruthy();
          expect(questionPage.rankedAnswersHeader.text()).toBe('Your Ranking');
        });
      });

      describe("if the answerId is specified", function() {
        describe("if the answer exists", function() {
          it("assigns the selectedAnswer to the currentConsensus and answerDetails, then fetches the answers comments and assigns those later", function() {
            waitsFor("comments and commenters to be fetched", function(complete) {
              questionPage.params({ questionId: question.id(), answerId: answer1.id() }).success(complete);

              expect(questionPage.answerDetails.loading()).toBeTruthy();

              expect(questionPage.answerDetails).toHaveClass('active');
              expect(questionPage.currentConsensus.selectedAnswer()).toEqual(answer1);
              expect(questionPage.answerDetails.answer()).toEqual(answer1);
              expect(questionPage.votes.selectedVoterId()).toBeFalsy();

              expect(questionPage.rankedAnswers.loading()).toBeFalsy();
              expect(questionPage.comments.loading()).toBeFalsy();
              expect(questionPage.votes.loading()).toBeFalsy();
            });

            runs(function() {
              expect(questionPage.answerDetails.loading()).toBeFalsy();

              expect(answer1.comments().size()).toBeGreaterThan(0);
              expect(answer1.commenters().size()).toBe(answer1.comments().size());
              expect(questionPage.answerDetails.comments.comments().tuples()).toEqual(answer1.comments().tuples());
              expect(questionPage.backLink).toBeVisible();
            });
          });
        });

        describe("if the answer does NOT exist", function() {
          beforeEach(function() {
            spyOn(Application, 'showPage');
          });

          it("navigates to the current user's ranking", function() {
            waitsFor("fetch to complete", function(complete) {
              var nonExistentAnswerId = 102934;
              questionPage.params({ questionId: question.id(), answerId: nonExistentAnswerId }).success(complete);
            });

            runs(function() {
              expect(Path.routes.current).toBe(question.url());
            });
          });
        });
      });
    });

    describe("when the current user subsequently changes", function() {
      describe("when displaying the current user's rankings", function() {
        beforeEach(function() {
          waitsFor("fetch to complete", function(complete) {
            questionPage.params({ questionId: question.id() }).success(complete);
          });
          runs(function() {
            expect(otherUser.rankings().size()).toBe(0);
          });
        });

        it("fetches the new user's rankings and displays them in the ranked answers view", function() {
          waitsFor("new rankings to be fetched", function(complete) {
            Application.currentUser(otherUser).success(complete);
          });

          runs(function() {
            expect(otherUser.rankings().size()).toBeGreaterThan(0);
            expect(questionPage.rankedAnswers.rankings().tuples()).toEqual(otherUser.rankings().tuples());
          });
        });
      });

      describe("when not displaying the current user's ranking", function() {
        it("fetches the new user's rankings for this question but does not change the view", function() {
          waitsFor("fetching of answer data", function(complete) {
            questionPage.params({ questionId: question.id(), answerId: answer1.id()}).success(complete);
          });

          waitsFor("new rankings to be fetched", function(complete) {
            expect(questionPage.answerDetails).toHaveClass('active');
            Application.currentUser(otherUser).success(complete);
          });

          runs(function() {
            expect(otherUser.rankings().size()).toBeGreaterThan(0);
            expect(questionPage.answerDetails).toHaveClass('active'); // we don't change the view
          });
        });
      });
    });

    describe("when the params hash differs by the time the fetch completes", function() {
      it("does not populate data for the old params", function() {
        waitsFor("fetch to complete", function(complete) {
          questionPage.params({ questionId: question.id(), answerId: answer1.id() }).success(complete);
          stubAjax();
          questionPage.params({ questionId: 999 });
        });

        runs(function() {
          expect(questionPage.answerDetails.answer()).not.toBeDefined();
        });
      });
    });
  });

  describe("local logic (no fetching)", function() {
    var currentUser, creator, organization, question, answer1, question2, editableByCurrentUser, mockedRandomString;
    var headlineTextWhenAdjustColumnTopWasCalled;

    beforeEach(function() {
      creator = User.createFromRemote({id: 1, firstName: "animal", lastName: "eater"});
      organization = Organization.createFromRemote({id: 1, name: "Neurotic designers", privacy: "public"});
      question = creator.questions().createFromRemote({id: 1, body: "What's a body?", details: "aoeu!", createdAt: 91234, organizationId: organization.id()});
      answer1 = question.answers().createFromRemote({id: 1, body: "Answer 1", position: 1, creatorId: creator.id(), createdAt: 2345});
      question2 = creator.questions().createFromRemote({id: 2, body: 'short body', details: "woo!", organizationId: organization.id(), createdAt: 91234});
      currentUser = organization.makeMember({id: 1, firstName: "John", lastName: "Five"});
      Application.currentUser(currentUser);
      useFakeServer();

      editableByCurrentUser = true;
      spyOn(Question.prototype, 'editableByCurrentUser').andCallFake(function() {
        return editableByCurrentUser;
      });

      mockedRandomString  = "sharecode1";
      spyOn(Application, 'randomString').andCallFake(function() {
        return mockedRandomString;
      });

      questionPage.params({questionId: question.id()});
      expect(Server.lastUpdate.record).toBe(organization.membershipForCurrentUser());
      Server.lastUpdate.simulateSuccess();
      Server.lastFetch.simulateSuccess();
    });

    describe("when a question is assigned", function() {
      it("assigns the question's body, details, avatar, and comments relation, and keeps the body and details up to date when they change", function() {
        expect(questionPage.body.html()).toEqual($.markdown(question.body()));
        expect(questionPage.details.html()).toEqual($.markdown(question.details()));
        question.remotelyUpdated({body: "what would satan & damien do?", details: "Isdf"});
        expect(questionPage.body.html()).toEqual($.markdown(question.body()));
        expect(questionPage.details.html()).toEqual($.markdown(question.details()));
        expect(questionPage.avatar.user()).toBe(question.creator());
        expect(questionPage.creatorName.text()).toBe(question.creator().fullName());
        expect(questionPage.createdAt.text()).toBe(question.formattedCreatedAt());
        expect(questionPage.comments.comments()).toBe(question.comments());

        questionPage.question(question2);
        expect(questionPage.body.text()).toEqual(question2.body());
        expect(questionPage.details.text()).toEqual(question2.details());

        question.remotelyUpdated({body: "what would you do for a klondike bar?", details: "jhjyg"});
        expect(questionPage.body.text()).toEqual(question2.body());
        expect(questionPage.details.text()).toEqual(question2.details());
      });

      it("does not leave dangling subscriptions on the previous question when another one is assigned", function() {
        var subCountBefore = question2.onUpdateNode.size();
        questionPage.question(question2);
        expect(question2.onUpdateNode.size()).toBeGreaterThan(subCountBefore);
        questionPage.question(question);
        expect(question2.onUpdateNode.size()).toBe(subCountBefore);
      });

      it("assigns the question's twitter intents url to the twitter button and the share code to the view, and keeps them updated if the question changes", function() {
        expect(questionPage.twitterButton.attr('href')).toBe(question.twitterIntentsUrlAndCode()[0]);
        expect(questionPage.twitterShareCode).toBe("sharecode1");

        mockedRandomString = "sharecode2";
        question.remotelyUpdated({body: "Hello???"});
        expect(questionPage.twitterButton.attr('href')).toBe(question.twitterIntentsUrlAndCode()[0]);
        expect(questionPage.twitterShareCode).toBe("sharecode2");
      });

    });

    describe("showing and hiding of the edit and destroy buttons", function() {
      describe("when the current user changes", function() {
        it("only shows the edit and destroy buttons if the current user can edit", function() {
          var user1 = User.createFromRemote({id: 101});
          var user2 = User.createFromRemote({id: 102});

          editableByCurrentUser = false;
          Application.currentUser(user1);
          expect(questionPage.editButton).toBeHidden();
          expect(questionPage.destroyButton).toBeHidden();

          editableByCurrentUser = true;
          Application.currentUser(user2);
          expect(questionPage.editButton).toBeVisible();
          expect(questionPage.destroyButton).toBeVisible();
        });
      });

      describe("when an question is assigned", function() {
        it("only shows the edit and destroy buttons if the current user can edit", function() {
          editableByCurrentUser = false;
          questionPage.question(question2);
          expect(questionPage.editButton).toBeHidden();
          expect(questionPage.destroyButton).toBeHidden();

          editableByCurrentUser = true;
          questionPage.question(question);
          expect(questionPage.editButton).toBeVisible();
          expect(questionPage.destroyButton).toBeVisible();
        });
      });
    });

    describe("showing and hiding of the edit fields", function() {
      it("shows the fields populates their vals, and focuses the body when the edit button is clicked and hides the fields when the cancel button is clicked", function() {
        expectFieldsHidden();

        question.remotelyUpdated({details: "and sometimes Y"});

        questionPage.editButton.click();
        expectFieldsVisible();
        expect(questionPage.editableBody[0]).toBe(document.activeElement);

        expect(questionPage.editableBody.val()).toBe(question.body());
        expect(questionPage.editableDetails.val()).toBe(question.details());
        expect(questionPage.charsRemaining.text()).toBe((140 - question.body().length).toString());

        questionPage.cancelEditButton.click();
        expectFieldsHidden();
        expectColumnTopCorrectlyAdjusted();
      });

      it("hides the editable fields when the question changes", function() {
        questionPage.editButton.click();
        expectFieldsVisible();

        questionPage.question(question2);
        expectFieldsHidden();
      });
    });

    describe("showing and hiding of the details", function() {
      describe("when an question is assigned", function() {
        it("shows the details if they aren't blank and hides them otherwise", function() {
          question2.remotelyUpdated({details: ""});

          questionPage.question(question2);

          expect(questionPage.details).toBeHidden();

          expect(question.details()).not.toBe("");
          questionPage.question(question);

          expect(questionPage.details).toBeVisible();
        });
      });

      describe("when the details are updated", function() {
        it("shows the details if they aren't blank and hides them otherwise", function() {
          questionPage.editableBody.val("aoeu");
          questionPage.editableDetails.val("");
          questionPage.updateButton.click();
          Server.lastUpdate.simulateSuccess();
          expect(questionPage.details).toBeHidden();

          questionPage.editableDetails.val("aoeuaoeu");
          questionPage.updateButton.click();
          Server.lastUpdate.simulateSuccess();
          expect(questionPage.details).toBeVisible();
        });
      });
    });

    describe("when the save is button is clicked", function() {
      var updates;

      beforeEach(function() {
        questionPage.editButton.click();
        updates = {
          body: "Relish",
          details: "That green stuff..."
        }

        questionPage.editableBody.val(updates.body);
        questionPage.editableDetails.val(updates.details);
      });

      describe("if the body is not blank and not too long", function() {
        it("updates the record's body and details on the server and hides the form", function() {
          questionPage.updateButton.click();

          expect(Server.updates.length).toBe(1);

          expect(Server.lastUpdate.dirtyFieldValues).toEqual(updates);
          Server.lastUpdate.simulateSuccess();

          expectFieldsHidden();

          expect(questionPage.body.text()).toBe(updates.body);
          expect(questionPage.details.text()).toBe(updates.details);
        });
      });

      describe("if the body is blank", function() {
        it("does not save the question or hide the fields", function() {
          questionPage.editableBody.val("    ");
          questionPage.updateButton.click();
          expect(Server.updates.length).toBe(0);
          expectFieldsVisible();
        });
      });

      describe("if the body exceeds 140 characters", function() {
        it("does not save the question or hide the fields", function() {
          var longBody = ""
          _.times(141, function() {
            longBody += "X"
          });
          questionPage.editableBody.val(longBody);
          questionPage.updateButton.click();
          expect(Server.updates.length).toBe(0);
          expectFieldsVisible();
        });
      });
    });

    describe("when the destroy button is clicked", function() {
      it("destroys the question if the user confirms the prompt", function() {
        var confirmValue = false;
        spyOn(window, 'confirm').andCallFake(function() {
          return confirmValue;
        });

        questionPage.destroyButton.click();

        expect(window.confirm).toHaveBeenCalled();
        expect(Server.destroys.length).toBe(0);

        window.confirm.reset();
        confirmValue = true;

        questionPage.destroyButton.click();

        expect(window.confirm).toHaveBeenCalled();
        expect(Server.destroys.length).toBe(1);
        expect(Server.lastDestroy.record).toBe(questionPage.question());
      });
    });

    describe("when the question is destroyed", function() {
      describe("when the question page is visible", function() {
        it("navigates back to the current organization page", function() {
          spyOn(Application, 'showPage');
          questionPage.question().remotelyDestroyed();
          expect(Path.routes.current).toBe(Application.currentOrganization().url());
        });
      });

      describe("when the question page is not visible", function() {
        it("does not change the url", function() {
          questionPage.hide();
          spyOn(Application, 'showPage');
          questionPage.question().remotelyDestroyed();
          expect(Application.showPage).not.toHaveBeenCalled();
        });
      });
    });

    describe("when the 'suggest an answer' button is clicked", function() {
      it("navigates to the url for new answers for the current question", function() {
        questionPage.question(question);
        questionPage.newAnswerLink.click();
        expect(Path.routes.current).toBe(question.url() + "/answers/new");
      });
    });

    describe("the facebook button", function() {
      it("shares the question when clicked", function() {
        spyOn(question, 'shareOnFacebook');
        questionPage.facebookButton.click();
        expect(question.shareOnFacebook).toHaveBeenCalled();
      });
    });

    describe("showing and hiding of the social buttons", function() {
      var privateOrg, privateOrgQuestion;

      beforeEach(function() {
        privateOrg = Organization.createFromRemote({id: 2, name: "Private Org", privacy: "private"});
        var member = privateOrg.makeMember({id: 3});
        privateOrgQuestion = privateOrg.questions().createFromRemote({id: 3, body: "Nobody knows", createdAt: 932, creatorId: member.id()});
      });

      it("hides the facebook and twitter buttons if the current org is private, and shows it otherwise", function() {
        expect(questionPage.facebookButton).toBeVisible();
        expect(questionPage.twitterButton).toBeVisible();

        questionPage.params({questionId: privateOrgQuestion.id()});

        expect(questionPage.facebookButton).toBeHidden();
        expect(questionPage.twitterButton).toBeHidden();

        questionPage.params({questionId: question.id()});

        expect(questionPage.facebookButton).toBeVisible();
        expect(questionPage.twitterButton).toBeVisible();
      });
    });

    describe("when the 'back to questions' link is clicked", function() {
      it("navigates to the question's organization page", function() {
        spyOn(Application, 'showPage');
        questionPage.organizationLink.click();
        expect(Path.routes.current).toBe(organization.url());
      });
    });

    describe("adjustment of the columns' top position", function() {
      beforeEach(function() {
        questionPage.question(question);
      });

      describe("when the question is assigned", function() {
        it("adjusts the top position of the columns ", function() {
          questionPage.question(question2);
          expectColumnTopCorrectlyAdjusted();

          questionPage.question(question);
          expectColumnTopCorrectlyAdjusted();
        });
      });

      describe("when the question body changes", function() {
        it("adjusts the top position of the columns after assigning it to the body div", function() {
          question.remotelyUpdated({body: "this is a longer body?"});
          expectColumnTopCorrectlyAdjusted();
        });
      });

      describe("when the edit button is clicked or the elastic textarea resizes", function() {
        it("adjusts the top position of the columns after assigning the question body to the body div", function() {
          questionPage.editButton.click();
          expectColumnTopCorrectlyAdjusted();

          questionPage.editableBody.trigger('elastic');
          expectColumnTopCorrectlyAdjusted();
        });
      });

      describe("after the page is shown", function() {
        it("adjusts the top position of the columns in case it was mis-adjusted while the question was hidden", function() {
          questionPage.hide();
          question.remotelyUpdated({body: "this is a longer body?"});
          questionPage.show();
          expectColumnTopCorrectlyAdjusted();
        });
      });
    })

    describe("adjustment of the comments height", function() {
      var longDetails = "";
      beforeEach(function() {
        longDetails = "";
        for (var i = 0; i < 10; i++) longDetails += "Bee bee boo boo ";
      });

      describe("when the details and creator div are populated or when the details change", function() {
        it("adjusts comments to fill remaining vertical space", function() {
          expectCommentsToHaveFullHeight();
          question.remotelyUpdated({details: longDetails});
          expectCommentsToHaveFullHeight();
        });
      });

      describe("when the window is resized", function() {
        it("adjusts comments to fill remaining vertical space", function() {
          Application.width(1000);
          question.remotelyUpdated({details: longDetails});

          Application.width(700);
          $(window).resize();
          expectCommentsToHaveFullHeight();
        });
      });

      describe("when showing or hiding the editable details", function() {
        it("adjusts comments to fill remaining vertical space", function() {
          questionPage.editButton.click();
          expectCommentsToHaveFullHeight();
        });
      });

      describe("when elastic is triggered on the or the body editable details", function() {
        it("adjusts comments to fill remaining vertical space", function() {
          questionPage.editButton.click();
          expectCommentsToHaveFullHeight();

          var columnHeightBeforeElastic = questionPage.find('#column1').height();
          questionPage.editableDetails.val(longDetails + longDetails);
          questionPage.editableDetails.keyup();
          expectCommentsToHaveFullHeight(columnHeightBeforeElastic);

          questionPage.editableDetails.val("");
          questionPage.editableDetails.keyup();
          expectCommentsToHaveFullHeight(columnHeightBeforeElastic);

          questionPage.editableBody.val(longDetails);
          questionPage.editableBody.keyup();
        });
      });

      function expectCommentsToHaveFullHeight(expectedBottom) {
        var commentsBottom = questionPage.comments.position().top + questionPage.comments.height();
        expect(commentsBottom).toBe(expectedBottom || questionPage.find('#column1').height());
      }
    });

    describe("showing and hiding of answer details based on clicking on different elements of the page", function() {
      var answer1Li, answer2Li;

      beforeEach(function() {
        question.answers().createFromRemote({id: 2, body: "Answer 2", position: 2, creatorId: creator.id(), createdAt: 2345});
        answer1Li = questionPage.find('li.answer:contains("Answer 1")');
        answer2Li = questionPage.find('li.answer:contains("Answer 2")');
        expect(answer1Li).toExist();
        expect(answer2Li).toExist();
      });

      describe("when clicking outside of the answers", function() {
        it("navigates back to the base question url to hide any currently displayed ranking / answer details", function() {
          spyOn(History, 'replaceState');
          var selectionString = "";
          spyOn(window, 'getSelection').andReturn({ toString: function() { return selectionString }});

          questionPage.click();
          expect(History.replaceState).toHaveBeenCalledWith(null, null, question.url());
          History.replaceState.reset();

          questionPage.editButton.click();
          expect(History.replaceState).not.toHaveBeenCalled();

          questionPage.editableBody.click();
          expect(History.replaceState).not.toHaveBeenCalled();

          answer1Li.click();
          expect(History.replaceState).not.toHaveBeenCalledWith(null, null, question.url());
          History.replaceState.reset();

          answer2Li.click();
          expect(History.replaceState).not.toHaveBeenCalledWith(null, null, question.url());
          History.replaceState.reset();

          answer1Li.children().click();
          expect(History.replaceState).not.toHaveBeenCalledWith(null, null, question.url());
          History.replaceState.reset();

          questionPage.answerDetails.click();
          expect(History.replaceState).not.toHaveBeenCalled();

          questionPage.answerDetails.find(':not(.close,.destroy,.more,.less)').click();
          expect(History.replaceState).not.toHaveBeenCalledWith(null, null, question.url());
          History.replaceState.reset();

          // does not navigate when selecting text
          selectionString = "foooo";
          questionPage.click();
          expect(History.replaceState).not.toHaveBeenCalled();
        });
      });

      describe("when clicking on a selected answer a second time", function() {
        it("navigates back to the base question url to hide the answer details", function() {
          answer1Li.click();

          spyOn(History, 'replaceState');
          answer1Li.click();
          expect(History.replaceState).toHaveBeenCalledWith(null, null, question.url());
        });
      });
    });

    describe("when the back link is clicked", function() {
      it("navigates to the question's url", function() {
        spyOn(History, 'replaceState');
        questionPage.backLink.click();

        expect(History.replaceState).toHaveBeenCalledWith(null,null,question.url());
      });
    });
    
    describe("when there is a twitter tweet event", function() {
      it("posts to /share for the 'twitter' service with the current question_id and share code, then refreshes the share code in case they tweet again", function() {
        Application.twitterInitialized();
        var shareCodeBefore = questionPage.twitterShareCode;
        mockedRandomString = 'sharecode99';

        twttr.events.trigger('tweet', {type: "tweet"});

        expect($.ajax).toHaveBeenCalled();
        expect(mostRecentAjaxRequest.type).toBe('post');
        expect(mostRecentAjaxRequest.url).toBe('/shares');
        expect(mostRecentAjaxRequest.data).toEqual({question_id: question.id(), code: shareCodeBefore, service: "twitter"});

        expect(questionPage.twitterShareCode).not.toBe(shareCodeBefore);
        expect(questionPage.twitterButton.attr('href')).toContain(questionPage.twitterShareCode);
      });
    });
  });

  describe("mixpanel tracking", function() {
    var creator, question;

    beforeEach(function() {
      creator = User.createFromRemote({id: 1});
      question = creator.questions().createFromRemote({id: 1, body: "What's the best kind of mate?", createdAt: 1234, organizationId: Organization.findSocial().id()});
    });

    describe("when the question changes", function() {
      it("pushes a 'view question' event to the mixpanel queue", function() {
        questionPage.question(question);
        expect(mpq.length).toBe(1);
        var event = mpq.pop();
        expect(event[0]).toBe('track');
        expect(event[1]).toBe('View Question');
      });
    });

    describe("when the question is updated", function() {
      beforeEach(function() {
        useFakeServer();
        questionPage.question(question);
        mpq = [];
        questionPage.editButton.click();
        questionPage.editableBody.val("Artichokes: what's your take?");
      });

      it("pushes an 'update question' event to the mixpanel queue", function() {
        questionPage.updateButton.click();
        Server.lastUpdate.simulateSuccess();
        expect(mpq.length).toBe(1);
        var event = mpq.pop();
        expect(event[0]).toBe('track');
        expect(event[1]).toBe('Update Question');
      });
    });

    describe("when there is a twitter tweet event", function() {
      it("pushes a 'Tweet' event to the mixpanel queue", function() {
        Application.twitterInitialized();
        questionPage.question(question);
        twttr.events.trigger('tweet', {type: "tweet"});
        var event = mpq.pop();
        expect(event[0]).toBe('track');
        expect(event[1]).toBe('Tweet');
        console.log(event[2]);
      });
    });
  });

  function expectColumnTopCorrectlyAdjusted() {
    expect(questionPage.columns.position().top).toBe(questionPage.columnTopPosition());
  }

  function expectFieldsVisible() {
    expect(questionPage.editableBody).toBeVisible();
    expect(questionPage.detailsHeader).toBeVisible();
    expect(questionPage.editableDetails).toBeVisible();
    expect(questionPage.cancelEditButton).toBeVisible();
    expect(questionPage.updateButton).toBeVisible();
    expect(questionPage.editButton).toBeHidden();
    expect(questionPage.body).toBeHidden();
    expect(questionPage.details).toBeHidden();
    expect(questionPage.destroyButton).toBeHidden();
  }

  function expectFieldsHidden() {
    expect(questionPage.detailsHeader).toBeHidden();
    expect(questionPage.editableBody).toBeHidden();
    expect(questionPage.editableDetails).toBeHidden();
    expect(questionPage.cancelEditButton).toBeHidden();
    expect(questionPage.updateButton).toBeHidden();
    expect(questionPage.editButton).toBeVisible();
    expect(questionPage.body).toBeVisible();
    expect(questionPage.details).toBeVisible();
  }
});
