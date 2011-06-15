//= require spec/spec_helper

describe("Views.Pages.Election.RankedCandidates", function() {
  var rankedCandidates, currentUser, election, candidate1, candidate2, ranking1, ranking2, rankingsRelation;

  beforeEach(function() {
    currentUser = User.createFromRemote({id: 1});
    election = Election.createFromRemote({id: 1});
    candidate1 = election.candidates().createFromRemote({id: 1, body: "Candidate 1"});
    candidate2 = election.candidates().createFromRemote({id: 2, body: "Candidate 2"});
    ranking1 = currentUser.rankings().createFromRemote({id: 1, electionId: election.id(), candidateId: candidate1.id(), position: 64});
    ranking2 = currentUser.rankings().createFromRemote({id: 2, electionId: election.id(), candidateId: candidate2.id(), position: -64});
    rankingsRelation = currentUser.rankingsForElection(election);
    attachLayout();
    Application.currentUser(currentUser);
    rankedCandidates = Application.electionPage.rankedCandidates;
  });

  describe("#rankings", function() {
    it("populates the list with candidates ordered according to their ranking's position, with the divider at position 0", function() {
      rankedCandidates.rankings(rankingsRelation);
      expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking1);
      expect(rankedCandidates.list.find('li').eq(1)).toMatchSelector('#separator');
      expect(rankedCandidates.list.find('li').eq(2).view().ranking).toBe(ranking2);
    });
  });

  describe("handling of sorting by user", function() {
    describe("rearranging lis that are already present in the list", function() {
      var candidate3, ranking3, ranking3Li, createOrUpdatePromise;

      beforeEach(function() {
        ranking2.remotelyUpdated({position: 32});
        candidate3 = election.candidates().createFromRemote({id: 3, body: "Candidate 3"});
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

        expect(rankedCandidates.lisByRankingId[ranking1.id()]).toBeUndefined();
      });

      it("removes negative rankings from the list", function() {
        rankedCandidates.rankings(rankingsRelation);
        ranking2.remotelyDestroyed();

        expect(rankedCandidates.list.find('li').size()).toBe(2);
        expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking1);
        expect(rankedCandidates.list.find('li').eq(1)).toMatchSelector('#separator');

        expect(rankedCandidates.lisByRankingId[ranking2.id()]).toBeUndefined();
      });
    });
  });
});
