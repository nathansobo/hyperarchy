//= require spec/spec_helper

describe("Views.Pages.Election.RankedCandidates", function() {
  var electionPage, rankedCandidates, currentUser, election, candidate1, candidate2, candidate3, ranking1, ranking2, rankingsRelation;

  beforeEach(function() {
    currentUser = User.createFromRemote({id: 1});
    election = Election.createFromRemote({id: 1});
    candidate1 = election.candidates().createFromRemote({id: 1, body: "Candidate 1"});
    candidate2 = election.candidates().createFromRemote({id: 2, body: "Candidate 2"});
    candidate3 = election.candidates().createFromRemote({id: 3, body: "Candidate 3"});
    ranking1 = currentUser.rankings().createFromRemote({id: 1, electionId: election.id(), candidateId: candidate1.id(), position: 64});
    ranking2 = currentUser.rankings().createFromRemote({id: 2, electionId: election.id(), candidateId: candidate2.id(), position: -64});
    rankingsRelation = currentUser.rankingsForElection(election);
    attachLayout();
    Application.currentUser(currentUser);
    electionPage = Application.electionPage;
    rankedCandidates = electionPage.rankedCandidates;
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
      expect(rankedCandidates.list.find('li').size()).toBe(2)
      expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(rankingB);

      rankingsRelation.createFromRemote({candidateId: candidate3.id(), position: 128});

      expect(rankedCandidates.list.find('li').size()).toBe(2)
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

        $('#jasmine_content').html(rankedCandidates);

        createOrUpdatePromise = new Monarch.Promise();
        spyOn(Ranking, 'createOrUpdate').andReturn(createOrUpdatePromise);
      });

      describe("dragging into the positive ranking region", function() {
        describe("when an li is dragged between existing positively ranked lis", function() {
          it("calls Ranking.createOrUpdate with the appropriate candidate and position", function() {
            ranking3Li.dragAbove(ranking2Li);

            expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, candidate3, 48);
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

            ranking3Li.dragAbove(rankedCandidates.separator);

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
            ranking1Li.dragAbove(ranking3Li);

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
            ranking1Li.dragAbove(ranking2Li);

            expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, candidate1, -16);
          });
        });

        describe("when an li is dragged to the first and only negative position", function() {
          it("calls Ranking.createOrUpdate with the appropriate candidate and position", function() {
            ranking2.remotelyDestroyed();
            ranking3.remotelyDestroyed();

            ranking1Li.dragBelow(rankedCandidates.separator);

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
    });

    describe("receiving new rankings from the current consensus", function() {
      var createOrUpdatePromise;
      beforeEach(function() {
        $("#jasmine_content").html(electionPage);
        electionPage.populateContent({electionId: election.id()});

        createOrUpdatePromise = new Monarch.Promise();
        spyOn(Ranking, 'createOrUpdate').andReturn(createOrUpdatePromise);
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
      });

      describe("when receiving a candidate that has already been ranked", function() {
        it("removes the previous RankingLi for the candidate and adds a new one, associating it with a position", function() {
          var candidate2Li = electionPage.currentConsensus.find('li:contains("Candidate 2")');
          var ranking1Li = rankedCandidates.find('li:contains("Candidate 1")');
          var numUpdateSubscriptionsBefore = ranking2.onUpdateNode.size();

          candidate2Li.dragAbove(ranking1Li);

          expect(rankedCandidates.list.find('li').size()).toBe(3);
          expect(rankedCandidates.list.find('li').eq(0).data('position')).toBe(128);

          expect(Ranking.createOrUpdate).toHaveBeenCalledWith(currentUser, candidate2, 128);


          // simulate creation of ranking on server
          ranking2.remotelyUpdated({position: 128});
          createOrUpdatePromise.triggerSuccess(ranking2);

          expect(ranking2.onUpdateNode.subscriptions.length).toBe(numUpdateSubscriptionsBefore);
        });
      });
    });
  });

  describe("handling of remote events on rankings", function() {
    describe("when a ranking crosses the separator", function() {
      it("responds to a positive ranking becoming the last negative ranking", function() {
        rankedCandidates.rankings(rankingsRelation);
        ranking1.remotelyUpdated({position: -128});
        expect(rankedCandidates.list.find('li').size()).toBe(3);
        expect(rankedCandidates.list.find('li').eq(0)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(1).view().ranking).toBe(ranking2);
        expect(rankedCandidates.list.find('li').eq(2).view().ranking).toBe(ranking1);
      });

      it("responds to a positive ranking becoming the only negative ranking", function() {
        ranking2.remotelyDestroyed();

        rankedCandidates.rankings(rankingsRelation);
        ranking1.remotelyUpdated({position: -64});
        expect(rankedCandidates.list.find('li').size()).toBe(2);
        expect(rankedCandidates.list.find('li').eq(0)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(1).view().ranking).toBe(ranking1);
      });

      it("responds to a positive ranking a negative ranking other than the last", function() {
        rankedCandidates.rankings(rankingsRelation);
        ranking1.remotelyUpdated({position: -32});
        expect(rankedCandidates.list.find('li').size()).toBe(3);
        expect(rankedCandidates.list.find('li').eq(0)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(1).view().ranking).toBe(ranking1);
        expect(rankedCandidates.list.find('li').eq(2).view().ranking).toBe(ranking2);
      });

      it("responds to a negative ranking becoming a positive ranking other than the last", function() {
        rankedCandidates.rankings(rankingsRelation);
        ranking2.remotelyUpdated({position: 128});
        expect(rankedCandidates.list.find('li').size()).toBe(3);
        expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking2);
        expect(rankedCandidates.list.find('li').eq(1).view().ranking).toBe(ranking1);
        expect(rankedCandidates.list.find('li').eq(2)).toMatchSelector('#separator');
      });

      it("responds to a negative ranking becoming the last positive ranking", function() {
        rankedCandidates.rankings(rankingsRelation);
        ranking2.remotelyUpdated({position: 32});
        expect(rankedCandidates.list.find('li').size()).toBe(3);
        expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking1);
        expect(rankedCandidates.list.find('li').eq(1).view().ranking).toBe(ranking2);
        expect(rankedCandidates.list.find('li').eq(2)).toMatchSelector('#separator');
      });

      it("responds to a negative ranking becoming the only positive ranking", function() {
        ranking1.remotelyDestroyed();

        rankedCandidates.rankings(rankingsRelation);
        ranking2.remotelyUpdated({position: 64});
        expect(rankedCandidates.list.find('li').size()).toBe(2);
        expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking2);
        expect(rankedCandidates.list.find('li').eq(1)).toMatchSelector('#separator');
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
        expect(rankedCandidates.list.find('li').eq(0)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(1).view().ranking).toBe(ranking2);
        expect(rankedCandidates.list.find('li').eq(2).view().ranking).toBe(ranking1);
      });

      it("responds to a negative ranking moving to a position other than the last", function() {
        ranking1.remotelyUpdated({position: -32});
        rankedCandidates.rankings(rankingsRelation);

        ranking2.remotelyUpdated({position: -16});
        expect(rankedCandidates.list.find('li').eq(0)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(1).view().ranking).toBe(ranking2);
        expect(rankedCandidates.list.find('li').eq(2).view().ranking).toBe(ranking1);
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

        expect(rankedCandidates.list.find('li').size()).toBe(2);
        expect(rankedCandidates.list.find('li').eq(0)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(1).view().ranking).toBe(ranking2);

        expect(rankedCandidates.lisByCandidateId[ranking1.candidateId()]).toBeUndefined();
      });

      it("removes negative rankings from the list", function() {
        rankedCandidates.rankings(rankingsRelation);
        ranking2.remotelyDestroyed();

        expect(rankedCandidates.list.find('li').size()).toBe(2);
        expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking1);
        expect(rankedCandidates.list.find('li').eq(1)).toMatchSelector('#separator');

        expect(rankedCandidates.lisByCandidateId[ranking2.candidateId()]).toBeUndefined();
      });
    });
  });

  describe("showing and hiding of drag targets", function() {
    describe("when the rankings relation is initially assigned", function() {
      beforeEach(function() {
        $("#jasmine_content").html(rankedCandidates);
      });

      describe("when there are no rankings", function() {
        it("shows both the positive and negative explanations", function() {
          ranking1.remotelyDestroyed();
          ranking2.remotelyDestroyed();

          rankedCandidates.rankings(rankingsRelation);

          expect(rankedCandidates.positiveDragTarget).toBeVisible();
          expect(rankedCandidates.negativeDragTarget).toBeVisible();

          expect(rankedCandidates.list.children().eq(0)).toMatchSelector("#good-ideas-explanation");
          expect(rankedCandidates.list.children().eq(1)).toMatchSelector("#separator");
          expect(rankedCandidates.list.children().eq(2)).toMatchSelector("#bad-ideas-explanation");
        });
      });

      describe("when there are no positive rankings, but there are negative ones", function() {
        it("shows only the positive explanation", function() {
          ranking1.remotelyDestroyed();

          rankedCandidates.rankings(rankingsRelation);

          expect(rankedCandidates.positiveDragTarget).toBeVisible();
          expect(rankedCandidates.negativeDragTarget).toBeHidden();

          expect(rankedCandidates.list.children().eq(0)).toMatchSelector("#good-ideas-explanation");
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
          expect(rankedCandidates.list.children().eq(2)).toMatchSelector("#bad-ideas-explanation");
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
        $("#jasmine_content").html(rankedCandidates);
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
          $("#jasmine_content").html(electionPage);
          electionPage.attach();
          electionPage.show();
          electionPage.populateContent({electionId: election.id()});
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
          $("#jasmine_content").html(rankedCandidates);
          rankedCandidates.attach();
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
