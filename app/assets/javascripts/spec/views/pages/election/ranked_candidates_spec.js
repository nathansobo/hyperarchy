//= require spec/spec_helper

describe("Views.Pages.Election.RankedCandidates", function() {
  var electionPage, rankedCandidates, currentUser, election, candidate1, candidate2, candidate3, ranking1, ranking2, rankingsRelation, createOrUpdatePromise;
  
  beforeEach(function() {
    currentUser = User.createFromRemote({id: 2, emailAddress: "foo@example.com"});
    currentUser.memberships().createFromRemote({organizationId: 1});
    election = Election.createFromRemote({id: 1, creatorId: 2, createdAt: 234234234, organizationId: 1});
    candidate1 = election.candidates().createFromRemote({id: 1, body: "Candidate 1", createdAt: 1308352736162, creatorId: 2});
    candidate2 = election.candidates().createFromRemote({id: 2, body: "Candidate 2", createdAt: 1308352736162, creatorId: 2});
    candidate3 = election.candidates().createFromRemote({id: 3, body: "Candidate 3", createdAt: 1308352736162, creatorId: 2});
    ranking1 = currentUser.rankings().createFromRemote({id: 1, electionId: election.id(), candidateId: candidate1.id(), position: 64});
    ranking2 = currentUser.rankings().createFromRemote({id: 2, electionId: election.id(), candidateId: candidate2.id(), position: -64});
    rankingsRelation = currentUser.rankingsForElection(election);
    renderLayout();

    Application.currentUser(currentUser);
    Application.height(640);
    electionPage = Application.electionPage;
    rankedCandidates = electionPage.rankedCandidates;
    spyOn(rankedCandidates, 'currentUserCanRank').andReturn(true);
    electionPage.show();

    createOrUpdatePromise = new Monarch.Promise();
    spyOn(Ranking, 'createOrUpdate').andReturn(createOrUpdatePromise);
  });

  describe("#rankings", function() {
    it("populates the list with candidates ordered according to their ranking's position, with the divider at position 0", function() {
      rankedCandidates.rankings(rankingsRelation);
      expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking1);
      expect(rankedCandidates.list.find('li').eq(1)).toMatchSelector('#separator');
      expect(rankedCandidates.list.find('li').eq(2).view().ranking).toBe(ranking2);
    });

    it("clears the list when a new relation is assigned", function() {
      rankedCandidates.rankings(rankingsRelation);
      expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking1);
      expect(rankedCandidates.list.find('li').eq(1)).toMatchSelector('#separator');
      expect(rankedCandidates.list.find('li').eq(2).view().ranking).toBe(ranking2);

      electionB = Election.createFromRemote({id: 100});
      var candidateB = election.candidates().createFromRemote({id: 100, body: "Candidate B"});
      var otherRankingsRelation = currentUser.rankingsForElection(electionB);
      var rankingB = otherRankingsRelation.createFromRemote({id: 1, candidateId: candidateB.id(), position: 64});

      rankedCandidates.rankings(otherRankingsRelation);
      expect(rankedCandidates.list.find('.ranking').size()).toBe(1);
      expect(rankedCandidates.list.find('.ranking').eq(0).view().ranking).toBe(rankingB);

      rankingsRelation.createFromRemote({candidateId: candidate3.id(), position: 128});

      expect(rankedCandidates.list.find('.ranking').size()).toBe(1);
    });

    describe("#sortingEnabled(boolean)", function() {
      it("shows and hides the drag target explanation", function() {
        rankedCandidates.rankings(rankingsRelation);
        ranking1.remotelyDestroyed();
        ranking2.remotelyDestroyed();

        expect(rankedCandidates.positiveDragExplanation).toBeVisible();
        expect(rankedCandidates.negativeDragExplanation).toBeVisible();

        rankedCandidates.sortingEnabled(false);

        expect(rankedCandidates.positiveDragExplanation).toBeHidden();
        expect(rankedCandidates.negativeDragExplanation).toBeHidden();

        rankedCandidates.sortingEnabled(true);

        expect(rankedCandidates.positiveDragExplanation).toBeVisible();
        expect(rankedCandidates.negativeDragExplanation).toBeVisible();
      });
    });
  });

  describe("drag and drop of rankings", function() {
    describe("sorting existing rankings", function() {
      var ranking3, ranking3Li, createOrUpdatePromise;

      beforeEach(function() {
        ranking2.remotelyUpdated({position: 32});
        ranking3 = currentUser.rankings().createFromRemote({id: 3, electionId: election.id(), candidateId: candidate3.id(), position: -64});
        rankedCandidates.rankings(rankingsRelation);

        ranking1Li = rankedCandidates.list.find('li:eq(0)');
        ranking2Li = rankedCandidates.list.find('li:eq(1)');
        ranking3Li = rankedCandidates.list.find('li:eq(3)');
      });

      describe("dragging into the positive ranking region", function() {
        describe("when an li is dragged between existing positively ranked lis", function() {
          it("calls Ranking.createOrUpdate with the appropriate candidate and position", function() {
            ranking3Li.dragAbove(ranking2Li);

            expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, candidate3, 48);
            console.debug();
          });
        });

        describe("when an li is dragged to the last positive position", function() {
          it("calls Ranking.createOrUpdate with the appropriate candidate and position", function() {
            ranking3Li.dragAbove(rankedCandidates.separator);

            expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, candidate3, 16);
          });
        });

        describe("when an li is dragged to the first positive position", function() {
          it("calls Ranking.createOrUpdate with the appropriate candidate and position", function() {
            ranking3Li.dragAbove(ranking1Li);

            expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, candidate3, 128);
          });
        });

        describe("when an li is dragged to the first and only positive position", function() {
          it("calls Ranking.createOrUpdate with the appropriate candidate and position", function() {
            ranking1.remotelyDestroyed();
            ranking2.remotelyDestroyed();

            ranking3Li.dragAbove(rankedCandidates.positiveDragTarget);

            expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, candidate3, 64);
          });
        });
      });

      describe("dragging into the negative ranking region", function() {
        beforeEach(function() {
          ranking2.remotelyUpdated({position: -32});
        });

        describe("when an li is dragged between existing negatively ranked lis", function() {
          it("calls Ranking.createOrUpdate with the appropriate candidate and position", function() {
            ranking1Li.dragBelow(ranking2Li);

            expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, candidate1, -48);
          });
        });

        describe("when an li is dragged to the last negative position", function() {
          it("calls Ranking.createOrUpdate with the appropriate candidate and position", function() {
            ranking1Li.dragBelow(ranking3Li);

            expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, candidate1, -128);
          });
        });

        describe("when an li is dragged to the first negative position", function() {
          it("calls Ranking.createOrUpdate with the appropriate candidate and position", function() {
            ranking1Li.dragBelow(rankedCandidates.separator);

            expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, candidate1, -16);
          });
        });

        describe("when an li is dragged to the first and only negative position", function() {
          it("calls Ranking.createOrUpdate with the appropriate candidate and position", function() {
            ranking2.remotelyDestroyed();
            ranking3.remotelyDestroyed();

            ranking1Li.dragBelow(rankedCandidates.negativeDragTarget);

            expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, candidate1, -64);
          });
        });
      });

      describe("the separator", function() {
        it("is not draggable", function() {
          expect(rankedCandidates.find('li').eq(2)).toMatchSelector('#separator');
          rankedCandidates.separator.dragAbove(ranking1Li);
          expect(rankedCandidates.find('li').eq(2)).toMatchSelector('#separator');
        });
      });

      describe("the drag target explanations", function() {
        it("does not allow them to be dragged", function() {
          ranking1.remotelyDestroyed();
          ranking2.remotelyDestroyed();
          ranking3.remotelyDestroyed();

          expect(rankedCandidates.positiveDragTarget).toBeVisible();
          expect(rankedCandidates.negativeDragTarget).toBeVisible();

          rankedCandidates.positiveDragTarget.dragAbove(rankedCandidates.negativeDragTarget);
          expect(rankedCandidates.find('li').eq(0)).toMatchSelector('#positive-drag-target');

          rankedCandidates.negativeDragTarget.dragAbove(rankedCandidates.positiveDragTarget);
          expect(rankedCandidates.find('li').eq(2)).toMatchSelector('#negative-drag-target');
        });
      });

      describe("when displaying another user's ranking", function() {
        beforeEach(function() {
          var otherUser = User.createFromRemote({id: 99});
          otherUser.rankings().createFromRemote({electionId: election.id(), candidateId: candidate1.id(), position: 64});
          rankedCandidates.rankings(otherUser.rankings());
        });

        it("does not allow the ranking lis to be dragged", function() {
          var otherUserRankingLi = rankedCandidates.find('li').eq(0);
          expect(otherUserRankingLi).toExist();
          otherUserRankingLi.dragBelow(rankedCandidates.separator);
          expect(Ranking.createOrUpdate).not.toHaveBeenCalled();
        });
      });
    });

    describe("receiving new rankings from the current consensus", function() {
      beforeEach(function() {
        electionPage.populateContentAfterFetch({electionId: election.id()});
      });

      describe("when receiving a candidate that has not yet been ranked", function() {
        it("adds a new RankingLi for the candidate and associates it with a position", function() {
          var candidate3Li = electionPage.currentConsensus.find('li:contains("Candidate 3")');
          var ranking1Li = rankedCandidates.find('li:contains("Candidate 1")');
          candidate3Li.dragAbove(ranking1Li);

          expect(rankedCandidates.list.find('li').size()).toBe(4);
          expect(rankedCandidates.list.find('li').eq(0).data('position')).toBe(128);

          expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, candidate3, 128);

          // simulate creation of ranking on server
          var ranking3 = Ranking.createFromRemote({id: 3, userId: currentUser.id(), candidateId: candidate3.id(), electionId: election.id(), position: 128});
          createOrUpdatePromise.triggerSuccess(ranking3);

          expect(rankedCandidates.list.find('li').size()).toBe(4);

          ranking3.remotelyUpdated({position: -128});

          expect(rankedCandidates.list.find('li').eq(3).data('position')).toBe(-128);
          expect(rankedCandidates.list.find('li').eq(3).view().ranking).toBe(ranking3);
        });

        it("allows the li to be dragged again before the ranking is created", function() {
          var candidate3Li = electionPage.currentConsensus.find('li:contains("Candidate 3")');
          var ranking1Li = rankedCandidates.find('li:contains("Candidate 1")');
          candidate3Li.dragAbove(ranking1Li);

          expect(Ranking.createOrUpdate).toHaveBeenCalled();
          Ranking.createOrUpdate.reset();

          var ranking3Li = rankedCandidates.find('li:contains("Candidate 3")');
          ranking3Li.dragBelow(rankedCandidates.separator);
          expect(Ranking.createOrUpdate).toHaveBeenCalled();
        });
      });

      describe("when receiving a candidate that has already been ranked", function() {
        it("removes the previous RankingLi for the candidate and adds a new one, associating it with a position", function() {
          var candidate2Li = electionPage.currentConsensus.find('li:contains("Candidate 2")');
          var ranking1Li = rankedCandidates.find('li:contains("Candidate 1")');
          var numUpdateSubscriptionsBefore = ranking2.onUpdateNode.size();

          candidate2Li.dragAbove(ranking1Li);

          expect(rankedCandidates.list.find('li.ranking').size()).toBe(2);
          expect(rankedCandidates.list.find('li.ranking').eq(0).data('position')).toBe(128);

          expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, candidate2, 128);


          // simulate creation of ranking on server
          ranking2.remotelyUpdated({position: 128});
          createOrUpdatePromise.triggerSuccess(ranking2);

          expect(ranking2.onUpdateNode.subscriptions.length).toBe(numUpdateSubscriptionsBefore);
        });
      });

      describe("when receiving a candidate in the positive region above the drag target", function() {
        it("computes the position correctly", function() {
          var candidate3Li = electionPage.currentConsensus.find('li:contains("Candidate 3")');
          ranking1.remotelyDestroyed();
          candidate3Li.dragAbove(rankedCandidates.positiveDragTarget);
          expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, candidate3, 64);
        });
      });

      describe("when the user is a guest", function() {
        var candidate3Li, existingUser;

        beforeEach(function() {
          existingUser = currentUser;
          enableAjax();
          unspy(rankedCandidates, 'currentUserCanRank');
          uploadRepository();
          fetchInitialRepositoryContents();

          expect(Application.currentUserId()).toBeDefined();
          expect(Application.currentUser()).toBeDefined();

          synchronously(function() {
            electionPage.params({electionId: election.id()});
          });

          candidate3Li = electionPage.currentConsensus.find('li:contains("Candidate 3")');

          expect(rankedCandidates.list.find('li.ranking')).not.toExist();
        });

        describe("when the user drags a candidate above the separator", function() {
          beforeEach(function() {
            candidate3Li.dragAbove(rankedCandidates.separator);
            expect(Ranking.createOrUpdate).not.toHaveBeenCalled();
            unspy(Ranking, 'createOrUpdate');
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
                rankingLi = rankedCandidates.find('li:contains("Candidate 3")').view();
                expect(rankingLi.nextAll('#separator')).toExist();
                expect(rankingLi.data('position')).toBe(64);
              });

              waitsFor("ranking to be createed", function() {
                return !Application.currentUser().rankings().empty()
              });

              runs(function() {
                var ranking = rankingLi.ranking;
                expect(ranking.position()).toBe(64);
                expect(ranking.candidate()).toEqual(candidate3);
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
                expect(Path.routes.current).toBe(election.url());
                expect(Application.currentUser().rankings().size()).toBe(2);
                rankingLi = rankedCandidates.find('li:contains("Candidate 3")').view();
                expect(rankingLi.prevAll('li')).not.toExist();
                expect(rankingLi.data('position')).toBe(128);
              });

              waitsFor("ranking to be createed", function() {
                return Application.currentUser().rankings().size() === 3;
              });

              runs(function() {
                var ranking = rankingLi.ranking;
                expect(ranking.position()).toBe(128);
                expect(ranking.candidate()).toEqual(candidate3);
                expect(ranking.user()).toEqual(existingUser);
              });
            });
          });
        });

        describe("when the user drags a candidate below the separator", function() {
          beforeEach(function() {
            candidate3Li.dragAbove(rankedCandidates.negativeDragTarget);
            expect(Ranking.createOrUpdate).not.toHaveBeenCalled();
            unspy(Ranking, 'createOrUpdate');
            expect(Application.signupForm).toBeVisible();
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
                rankingLi = rankedCandidates.find('li:contains("Candidate 3")').view();
                expect(rankingLi.prevAll('#separator')).toExist();
                expect(rankingLi.data('position')).toBe(-64);
              });

              waitsFor("ranking to be createed", function() {
                return !Application.currentUser().rankings().empty()
              });

              runs(function() {
                var ranking = rankingLi.ranking;
                expect(ranking.position()).toBe(-64);
                expect(ranking.candidate()).toEqual(candidate3);
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
                expect(Path.routes.current).toBe(election.url());
                expect(Application.currentUser().rankings().size()).toBe(2);
                rankingLi = rankedCandidates.find('li:contains("Candidate 3")').view();
                expect(rankingLi.nextAll('li')).not.toExist();
                expect(rankingLi.data('position')).toBe(-128);
              });

              waitsFor("ranking to be createed", function() {
                return Application.currentUser().rankings().size() === 3;
              });

              runs(function() {
                var ranking = rankingLi.ranking;
                expect(ranking.position()).toBe(-128);
                expect(ranking.candidate()).toEqual(candidate3);
                expect(ranking.user()).toEqual(existingUser);
              });
            });
          });
        });

        describe("when the user cancels the signup prompt", function() {
          it("does not create a ranking and removes the li from the list", function() {
            candidate3Li.dragAbove(rankedCandidates.separator);

            expect(Ranking.createOrUpdate).not.toHaveBeenCalled();
            expect(Application.signupForm).toBeVisible();

            expect(rankedCandidates.list.find('li.candidate')).toExist();
            Application.signupForm.closeX.click();
            expect(rankedCandidates.list.find('li.candidate')).not.toExist();
            expect(Ranking.createOrUpdate).not.toHaveBeenCalled();

            Application.signupForm.trigger('success');
            expect(rankedCandidates.list.find('li.ranking')).not.toExist();
            expect(Ranking.createOrUpdate).not.toHaveBeenCalled();
          });
        });

        describe("when the clicks log in at the signup prompt and then cancels at the login prompt", function() {
          it("does not create a ranking and removes the li from the list", function() {
            candidate3Li.dragAbove(rankedCandidates.separator);

            expect(Ranking.createOrUpdate).not.toHaveBeenCalled();
            expect(Application.signupForm).toBeVisible();
            Application.signupForm.loginFormLink.click();

            expect(rankedCandidates.list.find('li.candidate')).toExist();
            Application.loginForm.closeX.click();
            expect(rankedCandidates.list.find('li.candidate')).not.toExist();
            expect(Ranking.createOrUpdate).not.toHaveBeenCalled();

            Application.signupForm.trigger('success');
            expect(rankedCandidates.list.find('li.ranking')).not.toExist();
            expect(Ranking.createOrUpdate).not.toHaveBeenCalled();
          });
        });
      });
    });

    describe("removal of rankings by dragging out of the list", function() {
      var ranking1Li, ranking2Li;

      beforeEach(function() {
        electionPage.populateContentAfterFetch({electionId: election.id()});
        ranking1Li = rankedCandidates.list.find('li:eq(0)');
        ranking2Li = rankedCandidates.list.find('li:eq(1)');
      });

      describe("when dragging a ranking li whose ranking has been assigned", function() {
        it("removes the li, destroys the ranking, and displays the drag target if needed", function() {
          spyOn(ranking1, 'destroy');

          ranking1Li.simulate('drag', {dx: ranking1Li.width(), dy: 0});

          expect(rankedCandidates.separator.prevAll('.ranking')).not.toExist();
          expect(rankedCandidates.list).toContain('#positive-drag-target:visible');
          expect(ranking1.destroy).toHaveBeenCalled();

          expect(electionPage.find('.ui-sortable-helper')).toHaveClass('highlight');
          waits(500);

          runs(function() {
            expect(electionPage.find('.ui-sortable-helper')).not.toExist();
          });
        });
      });

      describe("when attempting to remove a ranking li whose ranking has not yet been assigned (because the initial ranking request is incomplete)", function() {
        it("does not remove the li and instead reverts it to its original location", function() {
          var candidate3Li = electionPage.currentConsensus.find('li:contains("Candidate 3")');
          
          candidate3Li.dragAbove(ranking1Li);

          expect(rankedCandidates.separator.prevAll('.ranking').size()).toBe(2);

          expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, candidate3, 128);
          // but we don't simulate a response yet, so dragging away should not remove it

          var ranking3Li = rankedCandidates.list.find('li').eq(0);
          ranking3Li.simulate('drag', {dx: ranking3Li.width(), dy: 0});
          expect(rankedCandidates.separator.prevAll('.ranking').size()).toBe(2);

          // now the simulate creation of a ranking on server
          var ranking3 = Ranking.createFromRemote({id: 3, userId: currentUser.id(), candidateId: candidate3.id(), electionId: election.id(), position: 128});
          createOrUpdatePromise.triggerSuccess(ranking3);

          expect(rankedCandidates.list.find('li').size()).toBe(4);

          // still responds to remote events
          ranking3.remotelyUpdated({position: -128});

          expect(rankedCandidates.list.find('li').eq(3).data('position')).toBe(-128);
          expect(rankedCandidates.list.find('li').eq(3).view().ranking).toBe(ranking3);
        });
      });
    });

  });

  describe("handling of remote events on rankings", function() {
    describe("when a ranking crosses the separator", function() {
      it("responds to a positive ranking becoming the last negative ranking", function() {
        rankedCandidates.rankings(rankingsRelation);
        ranking1.remotelyUpdated({position: -128});
        expect(rankedCandidates.list.find('li.ranking').size()).toBe(2);
        expect(rankedCandidates.list.find('li').eq(0)).toMatchSelector('#positive-drag-target');
        expect(rankedCandidates.list.find('li').eq(1)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(2).view().ranking).toBe(ranking2);
        expect(rankedCandidates.list.find('li').eq(3).view().ranking).toBe(ranking1);
      });

      it("responds to a positive ranking becoming the only negative ranking", function() {
        ranking2.remotelyDestroyed();

        rankedCandidates.rankings(rankingsRelation);
        ranking1.remotelyUpdated({position: -64});
        expect(rankedCandidates.list.find('li.ranking').size()).toBe(1);
        expect(rankedCandidates.list.find('li').eq(0)).toMatchSelector('#positive-drag-target');
        expect(rankedCandidates.list.find('li').eq(1)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(2).view().ranking).toBe(ranking1);
      });

      it("responds to a positive ranking a negative ranking other than the last", function() {
        rankedCandidates.rankings(rankingsRelation);
        ranking1.remotelyUpdated({position: -32});
        expect(rankedCandidates.list.find('li.ranking').size()).toBe(2);
        expect(rankedCandidates.list.find('li').eq(0)).toMatchSelector('#positive-drag-target');
        expect(rankedCandidates.list.find('li').eq(1)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(2).view().ranking).toBe(ranking1);
        expect(rankedCandidates.list.find('li').eq(3).view().ranking).toBe(ranking2);
      });

      it("responds to a negative ranking becoming a positive ranking other than the last", function() {
        rankedCandidates.rankings(rankingsRelation);
        ranking2.remotelyUpdated({position: 128});
        expect(rankedCandidates.list.find('li.ranking').size()).toBe(2);
        expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking2);
        expect(rankedCandidates.list.find('li').eq(1).view().ranking).toBe(ranking1);
        expect(rankedCandidates.list.find('li').eq(2)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(3)).toMatchSelector('#negative-drag-target');
      });

      it("responds to a negative ranking becoming the last positive ranking", function() {
        rankedCandidates.rankings(rankingsRelation);
        ranking2.remotelyUpdated({position: 32});
        expect(rankedCandidates.list.find('li.ranking').size()).toBe(2);
        expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking1);
        expect(rankedCandidates.list.find('li').eq(1).view().ranking).toBe(ranking2);
        expect(rankedCandidates.list.find('li').eq(2)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(3)).toMatchSelector('#negative-drag-target');
      });

      it("responds to a negative ranking becoming the only positive ranking", function() {
        ranking1.remotelyDestroyed();

        rankedCandidates.rankings(rankingsRelation);
        ranking2.remotelyUpdated({position: 64});
        expect(rankedCandidates.list.find('li.ranking').size()).toBe(1);
        expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking2);
        expect(rankedCandidates.list.find('li').eq(1)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(2)).toMatchSelector('#negative-drag-target');
      });
    });

    describe("when a ranking is updated without crossing the separator", function() {
      it("responds to a positive ranking becoming the last positive ranking", function() {
        ranking2.remotelyUpdated({position: 32});
        rankedCandidates.rankings(rankingsRelation);

        ranking1.remotelyUpdated({position: 16});
        expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking2);
        expect(rankedCandidates.list.find('li').eq(1).view().ranking).toBe(ranking1);
        expect(rankedCandidates.list.find('li').eq(2)).toMatchSelector('#separator');
      });

      it("responds to a positive ranking moving to a position other than the last", function() {
        ranking2.remotelyUpdated({position: 32});
        rankedCandidates.rankings(rankingsRelation);

        ranking2.remotelyUpdated({position: 128});
        expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking2);
        expect(rankedCandidates.list.find('li').eq(1).view().ranking).toBe(ranking1);
        expect(rankedCandidates.list.find('li').eq(2)).toMatchSelector('#separator');
      });

      it("responds to a negative ranking becoming the last negative ranking", function() {
        ranking1.remotelyUpdated({position: -32});
        rankedCandidates.rankings(rankingsRelation);

        ranking1.remotelyUpdated({position: -128});
        expect(rankedCandidates.list.find('li').eq(0)).toMatchSelector('#positive-drag-target');
        expect(rankedCandidates.list.find('li').eq(1)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(2).view().ranking).toBe(ranking2);
        expect(rankedCandidates.list.find('li').eq(3).view().ranking).toBe(ranking1);
      });

      it("responds to a negative ranking moving to a position other than the last", function() {
        ranking1.remotelyUpdated({position: -32});
        rankedCandidates.rankings(rankingsRelation);

        ranking2.remotelyUpdated({position: -16});
        expect(rankedCandidates.list.find('li').eq(0)).toMatchSelector('#positive-drag-target');
        expect(rankedCandidates.list.find('li').eq(1)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(2).view().ranking).toBe(ranking2);
        expect(rankedCandidates.list.find('li').eq(3).view().ranking).toBe(ranking1);
      });
    });

    describe("when a ranking is inserted", function() {
      it("responds to a ranking inserted in the last positive position", function() {
        rankedCandidates.rankings(rankingsRelation);
        candidate3 = election.candidates().createFromRemote({id: 3, body: "Candidate 3"});
        ranking3 = currentUser.rankings().createFromRemote({id: 3, electionId: election.id(), candidateId: candidate3.id(), position: 8});

        expect(rankedCandidates.list.find('li').size()).toBe(4);
        expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking1);
        expect(rankedCandidates.list.find('li').eq(1).view().ranking).toBe(ranking3);
        expect(rankedCandidates.list.find('li').eq(2)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(3).view().ranking).toBe(ranking2);
      });

      it("responds to a ranking inserted in a positive position other than the last", function() {
        rankedCandidates.rankings(rankingsRelation);
        candidate3 = election.candidates().createFromRemote({id: 3, body: "Candidate 3"});
        ranking3 = currentUser.rankings().createFromRemote({id: 3, electionId: election.id(), candidateId: candidate3.id(), position: 128});

        expect(rankedCandidates.list.find('li').size()).toBe(4);
        expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking3);
        expect(rankedCandidates.list.find('li').eq(1).view().ranking).toBe(ranking1);
        expect(rankedCandidates.list.find('li').eq(2)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(3).view().ranking).toBe(ranking2);
      });

      it("responds to a ranking inserted in the last negative position", function() {
        rankedCandidates.rankings(rankingsRelation);
        candidate3 = election.candidates().createFromRemote({id: 3, body: "Candidate 3"});
        ranking3 = currentUser.rankings().createFromRemote({id: 3, electionId: election.id(), candidateId: candidate3.id(), position: -128});

        expect(rankedCandidates.list.find('li').size()).toBe(4);
        expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking1);
        expect(rankedCandidates.list.find('li').eq(1)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(2).view().ranking).toBe(ranking2);
        expect(rankedCandidates.list.find('li').eq(3).view().ranking).toBe(ranking3);
      });

      it("responds to a ranking inserted in a negative position other than the last", function() {
        rankedCandidates.rankings(rankingsRelation);
        candidate3 = election.candidates().createFromRemote({id: 3, body: "Candidate 3"});
        ranking3 = currentUser.rankings().createFromRemote({id: 3, electionId: election.id(), candidateId: candidate3.id(), position: -32});

        expect(rankedCandidates.list.find('li').size()).toBe(4);
        expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking1);
        expect(rankedCandidates.list.find('li').eq(1)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(2).view().ranking).toBe(ranking3);
        expect(rankedCandidates.list.find('li').eq(3).view().ranking).toBe(ranking2);
      });
    });

    describe("when a ranking is removed", function() {
      it("removes positive rankings from the list", function() {
        rankedCandidates.rankings(rankingsRelation);
        ranking1.remotelyDestroyed();

        expect(rankedCandidates.list.find('li.ranking').size()).toBe(1);
        expect(rankedCandidates.list.find('li').eq(0)).toMatchSelector('#positive-drag-target');
        expect(rankedCandidates.list.find('li').eq(1)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(2).view().ranking).toBe(ranking2);

        expect(rankedCandidates.lisByCandidateId[ranking1.candidateId()]).toBeUndefined();
      });

      it("removes negative rankings from the list", function() {
        rankedCandidates.rankings(rankingsRelation);
        ranking2.remotelyDestroyed();

        expect(rankedCandidates.list.find('li.ranking').size()).toBe(1);
        expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking1);
        expect(rankedCandidates.list.find('li').eq(1)).toMatchSelector('#separator');

        expect(rankedCandidates.lisByCandidateId[ranking2.candidateId()]).toBeUndefined();
      });
    });
  });

  describe("showing and hiding of drag targets", function() {
    describe("when the rankings relation is initially assigned", function() {
      describe("when there are no rankings", function() {
        it("shows both the positive and negative explanations", function() {
          ranking1.remotelyDestroyed();
          ranking2.remotelyDestroyed();

          rankedCandidates.rankings(rankingsRelation);

          expect(rankedCandidates.positiveDragTarget).toBeVisible();
          expect(rankedCandidates.negativeDragTarget).toBeVisible();

          expect(rankedCandidates.list.children().eq(0)).toMatchSelector("#positive-drag-target");
          expect(rankedCandidates.list.children().eq(1)).toMatchSelector("#separator");
          expect(rankedCandidates.list.children().eq(2)).toMatchSelector("#negative-drag-target");
        });
      });

      describe("when there are no positive rankings, but there are negative ones", function() {
        it("shows only the positive explanation", function() {
          ranking1.remotelyDestroyed();

          rankedCandidates.rankings(rankingsRelation);

          expect(rankedCandidates.positiveDragTarget).toBeVisible();
          expect(rankedCandidates.negativeDragTarget).toBeHidden();

          expect(rankedCandidates.list.children().eq(0)).toMatchSelector("#positive-drag-target");
          expect(rankedCandidates.list.children().eq(1)).toMatchSelector("#separator");
          expect(rankedCandidates.list.children().eq(2).view().ranking).toBe(ranking2);
        });
      });

      describe("when there are no negative rankings, but there are positive ones", function() {
        it("shows only the negative explanation", function() {
          ranking2.remotelyDestroyed();

          rankedCandidates.rankings(rankingsRelation);

          expect(rankedCandidates.positiveDragTarget).toBeHidden();
          expect(rankedCandidates.negativeDragTarget).toBeVisible();

          expect(rankedCandidates.list.children().eq(0).view().ranking).toBe(ranking1);
          expect(rankedCandidates.list.children().eq(1)).toMatchSelector("#separator");
          expect(rankedCandidates.list.children().eq(2)).toMatchSelector("#negative-drag-target");
        });
      });

      describe("when there are both positive and negative rankings", function() {
        it("hides both explanations", function() {
          rankedCandidates.rankings(rankingsRelation);

          expect(rankedCandidates.positiveDragTarget).toBeHidden();
          expect(rankedCandidates.negativeDragTarget).toBeHidden();

          expect(rankedCandidates.list.children().eq(0).view().ranking).toBe(ranking1);
          expect(rankedCandidates.list.children().eq(1)).toMatchSelector("#separator");
          expect(rankedCandidates.list.children().eq(2).view().ranking).toBe(ranking2);
        });
      });
    });

    describe("when the rankings relation is mutated remotely", function() {
      beforeEach(function() {
        rankedCandidates.rankings(rankingsRelation);
      });

      it("shows the positive and negative drag targets when there are positive and negative rankings, and hides them otherwise", function() {
        expect(rankedCandidates.positiveDragTarget).toBeHidden();
        expect(rankedCandidates.negativeDragTarget).toBeHidden();

        ranking1.remotelyUpdated({position: -128});
        expect(rankedCandidates.positiveDragTarget).toBeVisible();
        expect(rankedCandidates.negativeDragTarget).toBeHidden();

        ranking1.remotelyUpdated({position: 64});
        expect(rankedCandidates.positiveDragTarget).toBeHidden();
        expect(rankedCandidates.negativeDragTarget).toBeHidden();

        ranking2.remotelyUpdated({position: 128});
        expect(rankedCandidates.positiveDragTarget).toBeHidden();
        expect(rankedCandidates.negativeDragTarget).toBeVisible();

        ranking2.remotelyUpdated({position: -64});
        expect(rankedCandidates.positiveDragTarget).toBeHidden();
        expect(rankedCandidates.negativeDragTarget).toBeHidden();

        ranking1.remotelyDestroyed();
        expect(rankedCandidates.positiveDragTarget).toBeVisible();
        expect(rankedCandidates.negativeDragTarget).toBeHidden();

        ranking2.remotelyDestroyed();
        expect(rankedCandidates.positiveDragTarget).toBeVisible();
        expect(rankedCandidates.negativeDragTarget).toBeVisible();

        rankingsRelation.createFromRemote({candidateId: 1, position: 64});
        expect(rankedCandidates.positiveDragTarget).toBeHidden();

        rankingsRelation.createFromRemote({candidateId: 2, position: -64});
        expect(rankedCandidates.negativeDragTarget).toBeHidden();
      });
    });

    describe("when rankings are dragged and dropped", function() {
      describe("when candidates are dragged in from the consensus", function() {
        beforeEach(function() {
          electionPage.populateContentAfterFetch({electionId: election.id()});
        });

        describe("when positive ranking lis are received from the current consensus", function() {
          it("shows the positive targets when there are positive and negative rankings, and hides them otherwise", function() {
            ranking1.remotelyDestroyed();
            expect(rankedCandidates.positiveDragTarget).toBeVisible();

            var candidate3Li = electionPage.currentConsensus.find('li:contains("Candidate 3")');

            candidate3Li.dragAbove(rankedCandidates.separator);
            expect(rankedCandidates.positiveDragTarget).toBeHidden();
          });
        });

        describe("when negative ranking lis are received from the current consensus", function() {
          it("shows negative drag targets when there are positive and negative rankings, and hides them otherwise", function() {
            ranking2.remotelyDestroyed();
            expect(rankedCandidates.negativeDragTarget).toBeVisible();

            var candidate3Li = electionPage.currentConsensus.find('li:contains("Candidate 3")');
            
            candidate3Li.dragAbove(rankedCandidates.negativeDragTarget);
            expect(rankedCandidates.negativeDragTarget).toBeHidden();
          });
        });
      });

      describe("when lis are moved within the ranked list", function() {
        beforeEach(function() {
          rankedCandidates.rankings(rankingsRelation);
        });

        it("shows the positive and negative drag targets when there are positive and negative rankings, and hides them otherwise", function() {
          var ranking1Li = rankedCandidates.list.find('li:eq(0)');
          var ranking2Li = rankedCandidates.list.find('li:eq(2)');

          expect(rankedCandidates.positiveDragTarget).toBeHidden();
          expect(rankedCandidates.negativeDragTarget).toBeHidden();

          ranking1Li.dragBelow(ranking2Li);
          expect(rankedCandidates.positiveDragTarget).toBeVisible();

          ranking1Li.dragAbove(rankedCandidates.separator);
          expect(rankedCandidates.positiveDragTarget).toBeHidden();

          ranking2Li.dragAbove(rankedCandidates.separator);
          expect(rankedCandidates.negativeDragTarget).toBeVisible();
        });
      });
    });
  });
});
