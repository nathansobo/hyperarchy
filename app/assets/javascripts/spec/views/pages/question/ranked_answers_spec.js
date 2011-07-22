//= require spec/spec_helper

describe("Views.Pages.Question.RankedAnswers", function() {
  var organization, questionPage, rankedAnswers, currentUser, question, answer1, answer2, answer3, ranking1, ranking2, rankingsRelation, lastCreateOrUpdatePromise;
  
  beforeEach(function() {
    organization = Organization.createFromRemote({id: 1})
    currentUser = organization.makeMember({id: 2, emailAddress: "foo@example.com"});
    question = Question.createFromRemote({id: 1, creatorId: 2, createdAt: 234234234, organizationId: organization.id()});
    answer1 = question.answers().createFromRemote({id: 1, body: "Answer 1", createdAt: 1308352736162, creatorId: 2});
    answer2 = question.answers().createFromRemote({id: 2, body: "Answer 2", createdAt: 1308352736162, creatorId: 2});
    answer3 = question.answers().createFromRemote({id: 3, body: "Answer 3", createdAt: 1308352736162, creatorId: 2});
    ranking1 = currentUser.rankings().createFromRemote({id: 1, questionId: question.id(), answerId: answer1.id(), position: 64});
    ranking2 = currentUser.rankings().createFromRemote({id: 2, questionId: question.id(), answerId: answer2.id(), position: -64});
    rankingsRelation = currentUser.rankingsForQuestion(question);
    renderLayout();
    spyOn(Application, 'showPage');

    Application.currentUser(currentUser);
    Application.currentOrganization(organization);
    Application.height(640);
    questionPage = Application.questionPage;
    rankedAnswers = questionPage.rankedAnswers;
    spyOn(rankedAnswers, 'currentUserCanRank').andReturn(true);
    questionPage.show();

    spyOn(Ranking, 'createOrUpdate').andCallFake(function() {
      return lastCreateOrUpdatePromise = new Monarch.Promise();
    });

    useFakeServer(true);
  });

  describe("rankings", function() {
    it("populates the list with answers ordered according to their ranking's position, with the divider at position 0", function() {
      rankedAnswers.rankings(rankingsRelation);
      expect(rankedAnswers.list.find('li').eq(0).view().ranking).toBe(ranking1);
      expect(rankedAnswers.list.find('li').eq(1)).toMatchSelector('#separator');
      expect(rankedAnswers.list.find('li').eq(2).view().ranking).toBe(ranking2);
    });

    it("clears the list when a new relation is assigned", function() {
      rankedAnswers.rankings(rankingsRelation);
      expect(rankedAnswers.list.find('li').eq(0).view().ranking).toBe(ranking1);
      expect(rankedAnswers.list.find('li').eq(1)).toMatchSelector('#separator');
      expect(rankedAnswers.list.find('li').eq(2).view().ranking).toBe(ranking2);

      questionB = Question.createFromRemote({id: 100});
      var answerB = question.answers().createFromRemote({id: 100, body: "Answer B"});
      var otherRankingsRelation = currentUser.rankingsForQuestion(questionB);
      var rankingB = otherRankingsRelation.createFromRemote({id: 1, answerId: answerB.id(), position: 64});

      rankedAnswers.rankings(otherRankingsRelation);

      expect(rankedAnswers.list.find('.ranking').size()).toBe(1);
      expect(rankedAnswers.list.find('.ranking').eq(0).view().ranking).toBe(rankingB);

      rankingsRelation.createFromRemote({answerId: answer3.id(), position: 128});

      expect(rankedAnswers.list.find('.ranking').size()).toBe(1);

      rankingsRelation.each(function(ranking) {
        expect(ranking.onUpdateNode.size()).toBe(1); // records subscribe to their own update, but that should be all
      });
    });

    describe("#sortingEnabled(boolean)", function() {
      it("shows and hides the drag target explanation", function() {
        rankedAnswers.rankings(rankingsRelation);
        ranking1.remotelyDestroyed();
        ranking2.remotelyDestroyed();

        expect(rankedAnswers.positiveDragExplanation).toBeVisible();
        expect(rankedAnswers.negativeDragExplanation).toBeVisible();

        rankedAnswers.sortingEnabled(false);

        expect(rankedAnswers.positiveDragExplanation).toBeHidden();
        expect(rankedAnswers.negativeDragExplanation).toBeHidden();

        rankedAnswers.sortingEnabled(true);

        expect(rankedAnswers.positiveDragExplanation).toBeVisible();
        expect(rankedAnswers.negativeDragExplanation).toBeVisible();
      });
    });
  });

  describe("drag and drop of rankings", function() {
    describe("sorting existing rankings", function() {
      var ranking3, ranking1Li, ranking2Li, ranking3Li;

      beforeEach(function() {
        ranking2.remotelyUpdated({position: 32});
        ranking3 = currentUser.rankings().createFromRemote({id: 3, questionId: question.id(), answerId: answer3.id(), position: -64});
        rankedAnswers.rankings(rankingsRelation);

        ranking1Li = rankedAnswers.list.find('li:eq(0)').view();
        ranking2Li = rankedAnswers.list.find('li:eq(1)').view();
        ranking3Li = rankedAnswers.list.find('li:eq(3)').view();
      });

      describe("dragging into the positive ranking region", function() {
        describe("when an li is dragged between existing positively ranked lis", function() {
          it("calls Ranking.createOrUpdate with the appropriate answer and position", function() {
            ranking3Li.dragAbove(ranking2Li);

            expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, answer3, 48);
          });
        });

        describe("when an li is dragged to the last positive position", function() {
          it("calls Ranking.createOrUpdate with the appropriate answer and position", function() {
            ranking3Li.dragAbove(rankedAnswers.separator);

            expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, answer3, 16);
          });
        });

        describe("when an li is dragged to the first positive position", function() {
          it("calls Ranking.createOrUpdate with the appropriate answer and position", function() {
            ranking3Li.dragAbove(ranking1Li);

            expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, answer3, 128);
          });
        });

        describe("when an li is dragged to the first and only positive position", function() {
          it("calls Ranking.createOrUpdate with the appropriate answer and position", function() {
            ranking1.remotelyDestroyed();
            ranking2.remotelyDestroyed();

            ranking3Li.dragAbove(rankedAnswers.positiveDragTarget);

            expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, answer3, 64);
          });
        });
      });

      describe("dragging into the negative ranking region", function() {
        beforeEach(function() {
          ranking2.remotelyUpdated({position: -32});
        });

        describe("when an li is dragged between existing negatively ranked lis", function() {
          it("calls Ranking.createOrUpdate with the appropriate answer and position", function() {
            ranking1Li.dragBelow(ranking2Li);

            expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, answer1, -48);
          });
        });

        describe("when an li is dragged to the last negative position", function() {
          it("calls Ranking.createOrUpdate with the appropriate answer and position", function() {
            ranking1Li.dragBelow(ranking3Li);

            expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, answer1, -128);
          });
        });

        describe("when an li is dragged to the first negative position", function() {
          it("calls Ranking.createOrUpdate with the appropriate answer and position", function() {
            ranking1Li.dragBelow(rankedAnswers.separator);

            expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, answer1, -16);
          });
        });

        describe("when an li is dragged to the first and only negative position", function() {
          it("calls Ranking.createOrUpdate with the appropriate answer and position", function() {
            ranking2.remotelyDestroyed();
            ranking3.remotelyDestroyed();

            ranking1Li.dragBelow(rankedAnswers.negativeDragTarget);

            expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, answer1, -64);
          });
        });
      });

      describe("the separator", function() {
        it("is not draggable", function() {
          expect(rankedAnswers.find('li').eq(2)).toMatchSelector('#separator');
          rankedAnswers.separator.dragAbove(ranking1Li);
          expect(rankedAnswers.find('li').eq(2)).toMatchSelector('#separator');
        });
      });

      describe("the drag target explanations", function() {
        it("does not allow them to be dragged", function() {
          ranking1.remotelyDestroyed();
          ranking2.remotelyDestroyed();
          ranking3.remotelyDestroyed();

          expect(rankedAnswers.positiveDragTarget).toBeVisible();
          expect(rankedAnswers.negativeDragTarget).toBeVisible();

          rankedAnswers.positiveDragTarget.dragAbove(rankedAnswers.negativeDragTarget);
          expect(rankedAnswers.find('li').eq(0)).toMatchSelector('#positive-drag-target');

          rankedAnswers.negativeDragTarget.dragAbove(rankedAnswers.positiveDragTarget);
          expect(rankedAnswers.find('li').eq(2)).toMatchSelector('#negative-drag-target');
        });
      });

      describe("when displaying another user's ranking", function() {
        beforeEach(function() {
          var otherUser = organization.makeMember({id: 99});
          otherUser.rankings().createFromRemote({questionId: question.id(), answerId: answer1.id(), position: 64});
          rankedAnswers.rankings(otherUser.rankings());
        });

        it("does not allow the ranking lis to be dragged", function() {
          var otherUserRankingLi = rankedAnswers.find('li').eq(0);
          expect(otherUserRankingLi).toExist();
          otherUserRankingLi.dragBelow(rankedAnswers.separator);
          expect(Ranking.createOrUpdate).not.toHaveBeenCalled();
        });
      });

      describe("showing and hiding of spinners", function() {
        it("shows the spinner while the ranking is being updated", function() {
          ranking3Li.dragAbove(ranking1Li);
          expect(ranking3Li.loading()).toBeTruthy();
          lastCreateOrUpdatePromise.triggerSuccess(ranking3);
          expect(ranking3Li.loading()).toBeFalsy();
        });

        it("does not hide the spinner if there are outstanding requests", function() {
          expect(Ranking.createOrUpdate).not.toHaveBeenCalled();

          ranking3Li.dragAbove(ranking1Li);
          expect(ranking3Li.loading()).toBeTruthy();

          var firstRequestPromise = lastCreateOrUpdatePromise;

          ranking3Li.dragAbove(ranking2Li);
          var secondRequestPromise = lastCreateOrUpdatePromise;
          expect(ranking3Li.loading()).toBeTruthy();

          firstRequestPromise.triggerSuccess(ranking3);
          expect(ranking3Li.loading()).toBeTruthy();

          secondRequestPromise.triggerSuccess(ranking3);
          expect(ranking3Li.loading()).toBeFalsy();
        });
      });
    });

    describe("receiving new rankings from the current consensus", function() {

      describe("when the current user is a member", function() {
        beforeEach(function() {
          questionPage.params({questionId: question.id()});
        });

        describe("when receiving a answer that has not yet been ranked", function() {
          it("adds a new RankingLi for the answer and associates it with a position", function() {
            var answer3Li = questionPage.currentConsensus.find('li:contains("Answer 3")');
            var ranking1Li = rankedAnswers.find('li:contains("Answer 1")');
            answer3Li.dragAbove(ranking1Li);

            expect(rankedAnswers.list.find('li').size()).toBe(4);
            expect(rankedAnswers.list.find('li').eq(0).data('position')).toBe(128);

            expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, answer3, 128);

            // simulate creation of ranking on server
            var ranking3 = Ranking.createFromRemote({id: 3, userId: currentUser.id(), answerId: answer3.id(), questionId: question.id(), position: 128});
            lastCreateOrUpdatePromise.triggerSuccess(ranking3);

            expect(rankedAnswers.list.find('li').size()).toBe(4);

            ranking3.remotelyUpdated({position: -128});

            expect(rankedAnswers.list.find('li').eq(3).data('position')).toBe(-128);
            expect(rankedAnswers.list.find('li').eq(3).view().ranking).toBe(ranking3);
          });

          it("allows the li to be dragged again before the ranking is created", function() {
            var answer3Li = questionPage.currentConsensus.find('li:contains("Answer 3")');
            var ranking1Li = rankedAnswers.find('li:contains("Answer 1")');
            answer3Li.dragAbove(ranking1Li);

            expect(Ranking.createOrUpdate).toHaveBeenCalled();
            Ranking.createOrUpdate.reset();

            var ranking3Li = rankedAnswers.find('li:contains("Answer 3")');
            ranking3Li.dragBelow(rankedAnswers.separator);
            expect(Ranking.createOrUpdate).toHaveBeenCalled();
          });
        });

        describe("when receiving a answer that has already been ranked", function() {
          it("removes the previous RankingLi for the answer and adds a new one, associating it with a position", function() {
            Server.auto = false;

            var answer2Li = questionPage.currentConsensus.find('li:contains("Answer 2")');
            var ranking1Li = rankedAnswers.find('li:contains("Answer 1")');

            var numUpdateSubscriptionsBefore = ranking2.onUpdateNode.size();

            Server.auto = true;
            answer2Li.dragAbove(ranking1Li);

            Server.auto = false;

            expect(rankedAnswers.list.find('li.ranking').size()).toBe(2);
            expect(rankedAnswers.list.find('li.ranking').eq(0).data('position')).toBe(128);

            expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, answer2, 128);


            // simulate creation of ranking on server
            ranking2.remotelyUpdated({position: 128});
            lastCreateOrUpdatePromise.triggerSuccess(ranking2);

            expect(ranking2.onUpdateNode.size()).toBe(numUpdateSubscriptionsBefore);
          });
        });

        describe("when receiving a answer in the positive region above the drag target", function() {
          it("computes the position correctly", function() {
            var answer3Li = questionPage.currentConsensus.find('li:contains("Answer 3")');
            ranking1.remotelyDestroyed();
            answer3Li.dragAbove(rankedAnswers.positiveDragTarget);
            expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, answer3, 64);
          });
        });
      });

      describe("when the user is a guest", function() {
        var answer3Li, existingUser;

        beforeEach(function() {
          existingUser = currentUser;
          enableAjax();
          unspy(rankedAnswers, 'currentUserCanRank');

          uploadRepository();
          fetchInitialRepositoryContents();

          expect(Application.currentUserId()).toBeDefined();
          expect(Application.currentUser()).toBeDefined();

          synchronously(function() {
            questionPage.params({questionId: question.id()});
          });

          answer3Li = questionPage.currentConsensus.find('li:contains("Answer 3")');

          expect(rankedAnswers.list.find('li.ranking')).not.toExist();
        });

        describe("when the user drags a answer above the separator", function() {
          beforeEach(function() {
            answer3Li.dragAbove(rankedAnswers.separator);
            expect(Ranking.createOrUpdate).not.toHaveBeenCalled();
            unspy(Ranking, 'createOrUpdate');
            expect(rankedAnswers.positiveDragTarget).toBeHidden();
            expect(Application.signupForm).toBeVisible();
          });

          describe("and then signs up at the prompt", function() {
            it("creates a positive ranking once they have signed up", function() {
              Application.signupForm.firstName.val("Max");
              Application.signupForm.lastName.val("Brunsfeld");
              Application.signupForm.emailAddress.val("maxbruns@example.com");
              Application.signupForm.password.val("password");

              waitsFor("signup to succeed", function(complete) {
                Application.signupForm.form.trigger('submit', complete);
              });

              var rankingLi;
              runs(function() {
                rankingLi = rankedAnswers.find('li:contains("Answer 3")').view();
                expect(rankingLi.nextAll('#separator')).toExist();
                expect(rankingLi.data('position')).toBe(64);
              });

              waitsFor("ranking to be createed", function() {
                return !Application.currentUser().rankings().empty()
              });

              runs(function() {
                var ranking = rankingLi.ranking;
                expect(ranking.position()).toBe(64);
                expect(ranking.answer()).toEqual(answer3);
                expect(ranking.user()).toEqual(Application.currentUser());
              });
            });
          });

          describe("and then logs in at the prompt", function() {
            it("creates a new positive ranking with a position greater than all previous rankings after they log in", function() {
              Application.signupForm.loginFormLink.click();

              Application.loginForm.emailAddress.val(existingUser.emailAddress());
              Application.loginForm.password.val("password");

              waitsFor("user to log in", function(complete) {
                Application.loginForm.form.trigger('submit', complete);
              });

              var rankingLi;
              runs(function() {
                expect(Path.routes.current).toBe(question.url());
                expect(Application.currentUser().rankings().size()).toBe(2);
                rankingLi = rankedAnswers.find('li:contains("Answer 3")').view();
                expect(rankingLi.prevAll('li')).not.toExist();
                expect(rankingLi.data('position')).toBe(128);
              });

              waitsFor("ranking to be createed", function() {
                return Application.currentUser().rankings().size() === 3;
              });

              runs(function() {
                var ranking = rankingLi.ranking;
                expect(ranking.position()).toBe(128);
                expect(ranking.answer()).toEqual(answer3);
                expect(ranking.user()).toEqual(existingUser);
              });
            });
          });
        });

        describe("when the user drags a answer below the separator", function() {
          beforeEach(function() {
            answer3Li.dragAbove(rankedAnswers.negativeDragTarget);
            expect(Ranking.createOrUpdate).not.toHaveBeenCalled();
            unspy(Ranking, 'createOrUpdate');
            expect(Application.signupForm).toBeVisible();
            expect(rankedAnswers.negativeDragTarget).toBeHidden();
          });

          describe("and then signs up at the prompt", function() {
            it("creates a negative ranking once they have signed up", function() {
              Application.signupForm.firstName.val("Max");
              Application.signupForm.lastName.val("Brunsfeld");
              Application.signupForm.emailAddress.val("maxbruns@example.com");
              Application.signupForm.password.val("password");

              waitsFor("signup to succeed", function(complete) {
                Application.signupForm.form.trigger('submit', complete);
              });

              var rankingLi;
              runs(function() {
                rankingLi = rankedAnswers.find('li:contains("Answer 3")').view();
                expect(rankingLi.prevAll('#separator')).toExist();
                expect(rankingLi.data('position')).toBe(-64);
              });

              waitsFor("ranking to be created", function() {
                return !Application.currentUser().rankings().empty()
              });

              runs(function() {
                var ranking = rankingLi.ranking;
                expect(ranking.position()).toBe(-64);
                expect(ranking.answer()).toEqual(answer3);
                expect(ranking.user()).toEqual(Application.currentUser());

                Application.currentUser(currentUser);
              });
            });
          });

          describe("and then logs in at the prompt", function() {
            it("creates a new negative ranking with a position less than all previous rankings after they log in", function() {
              Application.signupForm.loginFormLink.click();

              Application.loginForm.emailAddress.val(existingUser.emailAddress());
              Application.loginForm.password.val("password");

              waitsFor("user to log in", function(complete) {
                Application.loginForm.form.trigger('submit', complete);
              });

              var rankingLi;
              runs(function() {
                expect(Path.routes.current).toBe(question.url());
                expect(Application.currentUser().rankings().size()).toBe(2);
                rankingLi = rankedAnswers.find('li:contains("Answer 3")').view();
                expect(rankingLi.nextAll('li')).not.toExist();
                expect(rankingLi.data('position')).toBe(-128);
              });

              waitsFor("ranking to be createed", function() {
                return Application.currentUser().rankings().size() === 3;
              });

              runs(function() {
                var ranking = rankingLi.ranking;
                expect(ranking.position()).toBe(-128);
                expect(ranking.answer()).toEqual(answer3);
                expect(ranking.user()).toEqual(existingUser);
              });
            });
          });
        });

        describe("when the user cancels the signup prompt", function() {
          it("does not create a ranking and removes the li from the list", function() {
            answer3Li.dragAbove(rankedAnswers.separator);

            expect(Ranking.createOrUpdate).not.toHaveBeenCalled();
            expect(Application.signupForm).toBeVisible();

            expect(rankedAnswers.list.find('li.answer')).toExist();
            Application.signupForm.closeX.click();
            expect(rankedAnswers.list.find('li.answer')).not.toExist();
            expect(rankedAnswers.positiveDragTarget).toBeVisible();
            expect(Ranking.createOrUpdate).not.toHaveBeenCalled();

            Application.signupForm.trigger('success');
            expect(rankedAnswers.list.find('li.ranking')).not.toExist();
            expect(Ranking.createOrUpdate).not.toHaveBeenCalled();
          });
        });

        describe("when the clicks log in at the signup prompt and then cancels at the login prompt", function() {
          it("does not create a ranking and removes the li from the list", function() {
            answer3Li.dragAbove(rankedAnswers.separator);

            expect(Ranking.createOrUpdate).not.toHaveBeenCalled();
            expect(Application.signupForm).toBeVisible();
            Application.signupForm.loginFormLink.click();

            expect(rankedAnswers.list.find('li.answer')).toExist();
            Application.loginForm.closeX.click();
            expect(rankedAnswers.list.find('li.answer')).not.toExist();
            expect(rankedAnswers.positiveDragTarget).toBeVisible();
            expect(Ranking.createOrUpdate).not.toHaveBeenCalled();

            Application.signupForm.trigger('success');
            expect(rankedAnswers.list.find('li.ranking')).not.toExist();
            expect(Ranking.createOrUpdate).not.toHaveBeenCalled();
          });
        });
      });
    });

    describe("removal of rankings by dragging out of the list", function() {
      var ranking1Li, ranking2Li;

      beforeEach(function() {
        questionPage.params({questionId: question.id()});
        ranking1Li = rankedAnswers.list.find('li:eq(0)');
        ranking2Li = rankedAnswers.list.find('li:eq(1)');
      });

      describe("when dragging a ranking li whose ranking has been assigned", function() {
        it("removes the li, destroys the ranking, and displays the drag target if needed", function() {
          spyOn(ranking1, 'destroy');

          ranking1Li.simulate('drag', {dx: ranking1Li.width(), dy: 0});

          expect(rankedAnswers.separator.prevAll('.ranking')).not.toExist();
          expect(rankedAnswers.list).toContain('#positive-drag-target:visible');
          expect(ranking1.destroy).toHaveBeenCalled();

          expect(questionPage.find('.ui-sortable-helper')).toHaveClass('highlight');
          waits(500);

          runs(function() {
            expect(questionPage.find('.ui-sortable-helper')).not.toExist();
          });
        });
      });

      describe("when attempting to remove a ranking li whose ranking has not yet been assigned (because the initial ranking request is incomplete)", function() {
        it("does not remove the li and instead reverts it to its original location", function() {
          var answer3Li = questionPage.currentConsensus.find('li:contains("Answer 3")');
          
          answer3Li.dragAbove(ranking1Li);

          expect(rankedAnswers.separator.prevAll('.ranking').size()).toBe(2);

          expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, answer3, 128);
          // but we don't simulate a response yet, so dragging away should not remove it

          var ranking3Li = rankedAnswers.list.find('li').eq(0);
          ranking3Li.simulate('drag', {dx: ranking3Li.width(), dy: 0});
          expect(rankedAnswers.separator.prevAll('.ranking').size()).toBe(2);

          // now the simulate creation of a ranking on server
          var ranking3 = Ranking.createFromRemote({id: 3, userId: currentUser.id(), answerId: answer3.id(), questionId: question.id(), position: 128});
          lastCreateOrUpdatePromise.triggerSuccess(ranking3);

          expect(rankedAnswers.list.find('li').size()).toBe(4);

          // still responds to remote events
          ranking3.remotelyUpdated({position: -128});

          expect(rankedAnswers.list.find('li').eq(3).data('position')).toBe(-128);
          expect(rankedAnswers.list.find('li').eq(3).view().ranking).toBe(ranking3);
        });
      });
    });

  });

  describe("handling of remote events on rankings", function() {
    describe("when a ranking crosses the separator", function() {
      it("responds to a positive ranking becoming the last negative ranking", function() {
        rankedAnswers.rankings(rankingsRelation);
        ranking1.remotelyUpdated({position: -128});
        expect(rankedAnswers.list.find('li.ranking').size()).toBe(2);
        expect(rankedAnswers.list.find('li').eq(0)).toMatchSelector('#positive-drag-target');
        expect(rankedAnswers.list.find('li').eq(1)).toMatchSelector('#separator');
        expect(rankedAnswers.list.find('li').eq(2).view().ranking).toBe(ranking2);
        expect(rankedAnswers.list.find('li').eq(3).view().ranking).toBe(ranking1);
      });

      it("responds to a positive ranking becoming the only negative ranking", function() {
        ranking2.remotelyDestroyed();

        rankedAnswers.rankings(rankingsRelation);
        ranking1.remotelyUpdated({position: -64});
        expect(rankedAnswers.list.find('li.ranking').size()).toBe(1);
        expect(rankedAnswers.list.find('li').eq(0)).toMatchSelector('#positive-drag-target');
        expect(rankedAnswers.list.find('li').eq(1)).toMatchSelector('#separator');
        expect(rankedAnswers.list.find('li').eq(2).view().ranking).toBe(ranking1);
      });

      it("responds to a positive ranking a negative ranking other than the last", function() {
        rankedAnswers.rankings(rankingsRelation);
        ranking1.remotelyUpdated({position: -32});
        expect(rankedAnswers.list.find('li.ranking').size()).toBe(2);
        expect(rankedAnswers.list.find('li').eq(0)).toMatchSelector('#positive-drag-target');
        expect(rankedAnswers.list.find('li').eq(1)).toMatchSelector('#separator');
        expect(rankedAnswers.list.find('li').eq(2).view().ranking).toBe(ranking1);
        expect(rankedAnswers.list.find('li').eq(3).view().ranking).toBe(ranking2);
      });

      it("responds to a negative ranking becoming a positive ranking other than the last", function() {
        rankedAnswers.rankings(rankingsRelation);
        ranking2.remotelyUpdated({position: 128});
        expect(rankedAnswers.list.find('li.ranking').size()).toBe(2);
        expect(rankedAnswers.list.find('li').eq(0).view().ranking).toBe(ranking2);
        expect(rankedAnswers.list.find('li').eq(1).view().ranking).toBe(ranking1);
        expect(rankedAnswers.list.find('li').eq(2)).toMatchSelector('#separator');
        expect(rankedAnswers.list.find('li').eq(3)).toMatchSelector('#negative-drag-target');
      });

      it("responds to a negative ranking becoming the last positive ranking", function() {
        rankedAnswers.rankings(rankingsRelation);
        ranking2.remotelyUpdated({position: 32});
        expect(rankedAnswers.list.find('li.ranking').size()).toBe(2);
        expect(rankedAnswers.list.find('li').eq(0).view().ranking).toBe(ranking1);
        expect(rankedAnswers.list.find('li').eq(1).view().ranking).toBe(ranking2);
        expect(rankedAnswers.list.find('li').eq(2)).toMatchSelector('#separator');
        expect(rankedAnswers.list.find('li').eq(3)).toMatchSelector('#negative-drag-target');
      });

      it("responds to a negative ranking becoming the only positive ranking", function() {
        ranking1.remotelyDestroyed();

        rankedAnswers.rankings(rankingsRelation);
        ranking2.remotelyUpdated({position: 64});
        expect(rankedAnswers.list.find('li.ranking').size()).toBe(1);
        expect(rankedAnswers.list.find('li').eq(0).view().ranking).toBe(ranking2);
        expect(rankedAnswers.list.find('li').eq(1)).toMatchSelector('#separator');
        expect(rankedAnswers.list.find('li').eq(2)).toMatchSelector('#negative-drag-target');
      });
    });

    describe("when a ranking is updated without crossing the separator", function() {
      it("responds to a positive ranking becoming the last positive ranking", function() {
        ranking2.remotelyUpdated({position: 32});
        rankedAnswers.rankings(rankingsRelation);

        ranking1.remotelyUpdated({position: 16});
        expect(rankedAnswers.list.find('li').eq(0).view().ranking).toBe(ranking2);
        expect(rankedAnswers.list.find('li').eq(1).view().ranking).toBe(ranking1);
        expect(rankedAnswers.list.find('li').eq(2)).toMatchSelector('#separator');
      });

      it("responds to a positive ranking moving to a position other than the last", function() {
        ranking2.remotelyUpdated({position: 32});
        rankedAnswers.rankings(rankingsRelation);

        ranking2.remotelyUpdated({position: 128});
        expect(rankedAnswers.list.find('li').eq(0).view().ranking).toBe(ranking2);
        expect(rankedAnswers.list.find('li').eq(1).view().ranking).toBe(ranking1);
        expect(rankedAnswers.list.find('li').eq(2)).toMatchSelector('#separator');
      });

      it("responds to a negative ranking becoming the last negative ranking", function() {
        ranking1.remotelyUpdated({position: -32});
        rankedAnswers.rankings(rankingsRelation);

        ranking1.remotelyUpdated({position: -128});
        expect(rankedAnswers.list.find('li').eq(0)).toMatchSelector('#positive-drag-target');
        expect(rankedAnswers.list.find('li').eq(1)).toMatchSelector('#separator');
        expect(rankedAnswers.list.find('li').eq(2).view().ranking).toBe(ranking2);
        expect(rankedAnswers.list.find('li').eq(3).view().ranking).toBe(ranking1);
      });

      it("responds to a negative ranking moving to a position other than the last", function() {
        ranking1.remotelyUpdated({position: -32});
        rankedAnswers.rankings(rankingsRelation);

        ranking2.remotelyUpdated({position: -16});
        expect(rankedAnswers.list.find('li').eq(0)).toMatchSelector('#positive-drag-target');
        expect(rankedAnswers.list.find('li').eq(1)).toMatchSelector('#separator');
        expect(rankedAnswers.list.find('li').eq(2).view().ranking).toBe(ranking2);
        expect(rankedAnswers.list.find('li').eq(3).view().ranking).toBe(ranking1);
      });
    });

    describe("when a ranking is inserted", function() {
      it("responds to a ranking inserted in the last positive position", function() {
        rankedAnswers.rankings(rankingsRelation);
        answer3 = question.answers().createFromRemote({id: 3, body: "Answer 3"});
        ranking3 = currentUser.rankings().createFromRemote({id: 3, questionId: question.id(), answerId: answer3.id(), position: 8});

        expect(rankedAnswers.list.find('li').size()).toBe(4);
        expect(rankedAnswers.list.find('li').eq(0).view().ranking).toBe(ranking1);
        expect(rankedAnswers.list.find('li').eq(1).view().ranking).toBe(ranking3);
        expect(rankedAnswers.list.find('li').eq(2)).toMatchSelector('#separator');
        expect(rankedAnswers.list.find('li').eq(3).view().ranking).toBe(ranking2);
      });

      it("responds to a ranking inserted in a positive position other than the last", function() {
        rankedAnswers.rankings(rankingsRelation);
        answer3 = question.answers().createFromRemote({id: 3, body: "Answer 3"});
        ranking3 = currentUser.rankings().createFromRemote({id: 3, questionId: question.id(), answerId: answer3.id(), position: 128});

        expect(rankedAnswers.list.find('li').size()).toBe(4);
        expect(rankedAnswers.list.find('li').eq(0).view().ranking).toBe(ranking3);
        expect(rankedAnswers.list.find('li').eq(1).view().ranking).toBe(ranking1);
        expect(rankedAnswers.list.find('li').eq(2)).toMatchSelector('#separator');
        expect(rankedAnswers.list.find('li').eq(3).view().ranking).toBe(ranking2);
      });

      it("responds to a ranking inserted in the last negative position", function() {
        rankedAnswers.rankings(rankingsRelation);
        answer3 = question.answers().createFromRemote({id: 3, body: "Answer 3"});
        ranking3 = currentUser.rankings().createFromRemote({id: 3, questionId: question.id(), answerId: answer3.id(), position: -128});

        expect(rankedAnswers.list.find('li').size()).toBe(4);
        expect(rankedAnswers.list.find('li').eq(0).view().ranking).toBe(ranking1);
        expect(rankedAnswers.list.find('li').eq(1)).toMatchSelector('#separator');
        expect(rankedAnswers.list.find('li').eq(2).view().ranking).toBe(ranking2);
        expect(rankedAnswers.list.find('li').eq(3).view().ranking).toBe(ranking3);
      });

      it("responds to a ranking inserted in a negative position other than the last", function() {
        rankedAnswers.rankings(rankingsRelation);
        answer3 = question.answers().createFromRemote({id: 3, body: "Answer 3"});
        ranking3 = currentUser.rankings().createFromRemote({id: 3, questionId: question.id(), answerId: answer3.id(), position: -32});

        expect(rankedAnswers.list.find('li').size()).toBe(4);
        expect(rankedAnswers.list.find('li').eq(0).view().ranking).toBe(ranking1);
        expect(rankedAnswers.list.find('li').eq(1)).toMatchSelector('#separator');
        expect(rankedAnswers.list.find('li').eq(2).view().ranking).toBe(ranking3);
        expect(rankedAnswers.list.find('li').eq(3).view().ranking).toBe(ranking2);
      });
    });

    describe("when a ranking is removed", function() {
      it("removes positive rankings from the list", function() {
        rankedAnswers.rankings(rankingsRelation);
        ranking1.remotelyDestroyed();

        expect(rankedAnswers.list.find('li.ranking').size()).toBe(1);
        expect(rankedAnswers.list.find('li').eq(0)).toMatchSelector('#positive-drag-target');
        expect(rankedAnswers.list.find('li').eq(1)).toMatchSelector('#separator');
        expect(rankedAnswers.list.find('li').eq(2).view().ranking).toBe(ranking2);

        expect(rankedAnswers.lisByAnswerId[ranking1.answerId()]).toBeUndefined();
      });

      it("removes negative rankings from the list", function() {
        rankedAnswers.rankings(rankingsRelation);
        ranking2.remotelyDestroyed();

        expect(rankedAnswers.list.find('li.ranking').size()).toBe(1);
        expect(rankedAnswers.list.find('li').eq(0).view().ranking).toBe(ranking1);
        expect(rankedAnswers.list.find('li').eq(1)).toMatchSelector('#separator');

        expect(rankedAnswers.lisByAnswerId[ranking2.answerId()]).toBeUndefined();
      });
    });

    describe("when the ranking has an outstanding request", function() {
      it("is not relocated", function() {
        rankedAnswers.rankings(rankingsRelation);
        var ranking1Li = rankedAnswers.find('li:contains("Answer 1")').view();
        var ranking2Li = rankedAnswers.find('li:contains("Answer 2")').view();

        ranking2Li.dragAbove(ranking1Li);
        expect(Ranking.createOrUpdate).toHaveBeenCalled();
        var firstRequestPromise = lastCreateOrUpdatePromise;

        Ranking.createOrUpdate.reset();
        ranking2Li.dragAbove(rankedAnswers.negativeDragTarget);
        expect(Ranking.createOrUpdate).toHaveBeenCalled();
        var secondRequestPromise = lastCreateOrUpdatePromise;

        // simulate completion of first request
        ranking2.remotelyUpdated({position: 128});
        firstRequestPromise.triggerSuccess(ranking2);

        expect(ranking2Li.loading()).toBeTruthy();
        expect(ranking2Li.prev('#separator')).toExist();

        ranking2.remotelyUpdated({position: -64});
        secondRequestPromise.triggerSuccess(ranking2);
        expect(ranking2Li.loading()).toBeFalsy();
      });
    });
  });

  describe("when an answer's body is updated", function() {
    it("updates it in the list", function() {
      rankedAnswers.rankings(rankingsRelation);
      var ranking1Li = rankedAnswers.list.find('li:contains("Answer 1")').view();
      answer1.remotelyUpdated({body: "*New* Answer 1"});
      expect(ranking1Li.body.html()).toBe("<p><em>New</em> Answer 1</p>");
    });
  });

  describe("showing and hiding of drag targets", function() {
    describe("when the rankings relation is initially assigned", function() {
      describe("when there are no rankings", function() {
        it("shows both the positive and negative explanations", function() {
          ranking1.remotelyDestroyed();
          ranking2.remotelyDestroyed();

          rankedAnswers.rankings(rankingsRelation);

          expect(rankedAnswers.positiveDragTarget).toBeVisible();
          expect(rankedAnswers.negativeDragTarget).toBeVisible();

          expect(rankedAnswers.list.children().eq(0)).toMatchSelector("#positive-drag-target");
          expect(rankedAnswers.list.children().eq(1)).toMatchSelector("#separator");
          expect(rankedAnswers.list.children().eq(2)).toMatchSelector("#negative-drag-target");
        });
      });

      describe("when there are no positive rankings, but there are negative ones", function() {
        it("shows only the positive explanation", function() {
          ranking1.remotelyDestroyed();

          rankedAnswers.rankings(rankingsRelation);

          expect(rankedAnswers.positiveDragTarget).toBeVisible();
          expect(rankedAnswers.negativeDragTarget).toBeHidden();

          expect(rankedAnswers.list.children().eq(0)).toMatchSelector("#positive-drag-target");
          expect(rankedAnswers.list.children().eq(1)).toMatchSelector("#separator");
          expect(rankedAnswers.list.children().eq(2).view().ranking).toBe(ranking2);
        });
      });

      describe("when there are no negative rankings, but there are positive ones", function() {
        it("shows only the negative explanation", function() {
          ranking2.remotelyDestroyed();

          rankedAnswers.rankings(rankingsRelation);

          expect(rankedAnswers.positiveDragTarget).toBeHidden();
          expect(rankedAnswers.negativeDragTarget).toBeVisible();

          expect(rankedAnswers.list.children().eq(0).view().ranking).toBe(ranking1);
          expect(rankedAnswers.list.children().eq(1)).toMatchSelector("#separator");
          expect(rankedAnswers.list.children().eq(2)).toMatchSelector("#negative-drag-target");
        });
      });

      describe("when there are both positive and negative rankings", function() {
        it("hides both explanations", function() {
          rankedAnswers.rankings(rankingsRelation);

          expect(rankedAnswers.positiveDragTarget).toBeHidden();
          expect(rankedAnswers.negativeDragTarget).toBeHidden();

          expect(rankedAnswers.list.children().eq(0).view().ranking).toBe(ranking1);
          expect(rankedAnswers.list.children().eq(1)).toMatchSelector("#separator");
          expect(rankedAnswers.list.children().eq(2).view().ranking).toBe(ranking2);
        });
      });
    });

    describe("when the rankings relation is mutated remotely", function() {
      beforeEach(function() {
        rankedAnswers.rankings(rankingsRelation);
      });

      it("shows the positive and negative drag targets when there are positive and negative rankings, and hides them otherwise", function() {
        expect(rankedAnswers.positiveDragTarget).toBeHidden();
        expect(rankedAnswers.negativeDragTarget).toBeHidden();

        ranking1.remotelyUpdated({position: -128});
        expect(rankedAnswers.positiveDragTarget).toBeVisible();
        expect(rankedAnswers.negativeDragTarget).toBeHidden();

        ranking1.remotelyUpdated({position: 64});
        expect(rankedAnswers.positiveDragTarget).toBeHidden();
        expect(rankedAnswers.negativeDragTarget).toBeHidden();

        ranking2.remotelyUpdated({position: 128});
        expect(rankedAnswers.positiveDragTarget).toBeHidden();
        expect(rankedAnswers.negativeDragTarget).toBeVisible();

        ranking2.remotelyUpdated({position: -64});
        expect(rankedAnswers.positiveDragTarget).toBeHidden();
        expect(rankedAnswers.negativeDragTarget).toBeHidden();

        ranking1.remotelyDestroyed();
        expect(rankedAnswers.positiveDragTarget).toBeVisible();
        expect(rankedAnswers.negativeDragTarget).toBeHidden();

        ranking2.remotelyDestroyed();
        expect(rankedAnswers.positiveDragTarget).toBeVisible();
        expect(rankedAnswers.negativeDragTarget).toBeVisible();

        rankingsRelation.createFromRemote({answerId: 1, position: 64});
        expect(rankedAnswers.positiveDragTarget).toBeHidden();

        rankingsRelation.createFromRemote({answerId: 2, position: -64});
        expect(rankedAnswers.negativeDragTarget).toBeHidden();
      });
    });

    describe("when rankings are dragged and dropped", function() {
      describe("when answers are dragged in from the consensus", function() {
        beforeEach(function() {
          questionPage.params({questionId: question.id()});
        });

        describe("when positive ranking lis are received from the current consensus", function() {
          it("shows the positive targets when there are positive and negative rankings, and hides them otherwise", function() {
            ranking1.remotelyDestroyed();
            expect(rankedAnswers.positiveDragTarget).toBeVisible();

            var answer3Li = questionPage.currentConsensus.find('li:contains("Answer 3")');

            answer3Li.dragAbove(rankedAnswers.separator);
            expect(rankedAnswers.positiveDragTarget).toBeHidden();
          });
        });

        describe("when negative ranking lis are received from the current consensus", function() {
          it("shows negative drag targets when there are positive and negative rankings, and hides them otherwise", function() {
            ranking2.remotelyDestroyed();
            expect(rankedAnswers.negativeDragTarget).toBeVisible();

            var answer3Li = questionPage.currentConsensus.find('li:contains("Answer 3")');
            
            answer3Li.dragAbove(rankedAnswers.negativeDragTarget);
            expect(rankedAnswers.negativeDragTarget).toBeHidden();
          });
        });
      });

      describe("when lis are moved within the ranked list", function() {
        beforeEach(function() {
          rankedAnswers.rankings(rankingsRelation);
        });

        it("shows the positive and negative drag targets when there are positive and negative rankings, and hides them otherwise", function() {
          var ranking1Li = rankedAnswers.list.find('li:eq(0)');
          var ranking2Li = rankedAnswers.list.find('li:eq(2)');

          expect(rankedAnswers.positiveDragTarget).toBeHidden();
          expect(rankedAnswers.negativeDragTarget).toBeHidden();

          ranking1Li.dragBelow(ranking2Li);
          expect(rankedAnswers.positiveDragTarget).toBeVisible();

          ranking1Li.dragAbove(rankedAnswers.separator);
          expect(rankedAnswers.positiveDragTarget).toBeHidden();

          ranking2Li.dragAbove(rankedAnswers.separator);
          expect(rankedAnswers.negativeDragTarget).toBeVisible();
        });
      });
    });
  });

  describe("#loading", function() {
    it("hides the list and shows the spinner if loading", function() {
      rankedAnswers.loading(true);

      expect(rankedAnswers.list).toBeHidden();
      expect(rankedAnswers.spinner).toBeVisible();

      rankedAnswers.loading(false);

      expect(rankedAnswers.list).toBeVisible();
      expect(rankedAnswers.spinner).toBeHidden();
    });
  });
  
  describe("mixpanel events", function() {
    var ranking3, ranking1Li, ranking2Li, ranking3Li;

    beforeEach(function() {
      questionPage.params({questionId: question.id()});
      ranking2.remotelyUpdated({position: 32});
      ranking3 = currentUser.rankings().createFromRemote({id: 3, questionId: question.id(), answerId: answer3.id(), position: -64});
      rankedAnswers.rankings(rankingsRelation);

      ranking1Li = rankedAnswers.list.find('li:eq(0)').view();
      ranking2Li = rankedAnswers.list.find('li:eq(1)').view();
      ranking3Li = rankedAnswers.list.find('li:eq(3)').view();
      mpq = [];
    });

    describe("when a ranking is updated", function() {
      it("pushes an event to the mixpanel queue", function() {
        ranking2Li.dragAbove(ranking1Li);

        lastCreateOrUpdatePromise.triggerSuccess(ranking2);
        expect(mpq.length).toBe(1);
        var updateEvent = mpq.pop();
        expect(updateEvent[0]).toBe('track');
        expect(updateEvent[1]).toContain('Ranking');
      });
    });
    
    describe("when a ranking is created", function() {
      it("pushes an event to the mixpanel queue", function() {
        ranking3.remotelyDestroyed();
        var answer3Li = questionPage.currentConsensus.find('li:contains("Answer 3")');
        expect(answer3Li).toExist();
        answer3Li.dragAbove(rankedAnswers.separator);
        var ranking4 = Application.currentUser().rankings().createFromRemote({answerId: answer3.id(), position: 8});

        lastCreateOrUpdatePromise.triggerSuccess(ranking4);
        var createEvent = mpq.pop();
        expect(createEvent[0]).toBe('track');
        expect(createEvent[1]).toContain('Ranking');
      });
    });
  });
});
