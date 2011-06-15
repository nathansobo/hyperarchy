//= require spec/spec_helper

describe("Views.Pages.Election.RankedCandidates", function() {
  var rankedCandidates, user, election, candidate1, candidate2, ranking1, ranking2, rankingsRelation;

  beforeEach(function() {
    user = User.createFromRemote({id: 1});
    election = Election.createFromRemote({id: 1});
    candidate1 = election.candidates().createFromRemote({id: 1, body: "Candidate 1"});
    candidate2 = election.candidates().createFromRemote({id: 2, body: "Candidate 2"});
    ranking1 = user.rankings().createFromRemote({id: 1, electionId: election.id(), candidateId: candidate1.id(), position: 64});
    ranking2 = user.rankings().createFromRemote({id: 2, electionId: election.id(), candidateId: candidate2.id(), position: -64});
    rankingsRelation = user.rankingsForElection(election);
    attachLayout();
    rankedCandidates = Application.electionPage.rankedCandidates;
  });

  describe("#rankings", function() {
    it("populates the list with candidates ordered according to their ranking's position, with the divider at position 0", function() {
      rankedCandidates.rankings(rankingsRelation);
      expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking1);
      expect(rankedCandidates.list.find('li').eq(1)).toMatchSelector('#separator');
      expect(rankedCandidates.list.find('li').eq(2).view().ranking).toBe(ranking2);
    });

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
        ranking3 = user.rankings().createFromRemote({id: 3, electionId: election.id(), candidateId: candidate3.id(), position: 8});

        expect(rankedCandidates.list.find('li').size()).toBe(4);
        expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking1);
        expect(rankedCandidates.list.find('li').eq(1).view().ranking).toBe(ranking3);
        expect(rankedCandidates.list.find('li').eq(2)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(3).view().ranking).toBe(ranking2);
      });

      it("responds to a ranking inserted in a positive position other than the last", function() {
        rankedCandidates.rankings(rankingsRelation);
        candidate3 = election.candidates().createFromRemote({id: 3, body: "Candidate 3"});
        ranking3 = user.rankings().createFromRemote({id: 3, electionId: election.id(), candidateId: candidate3.id(), position: 128});

        expect(rankedCandidates.list.find('li').size()).toBe(4);
        expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking3);
        expect(rankedCandidates.list.find('li').eq(1).view().ranking).toBe(ranking1);
        expect(rankedCandidates.list.find('li').eq(2)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(3).view().ranking).toBe(ranking2);
      });

      it("responds to a ranking inserted in the last negative position", function() {
        rankedCandidates.rankings(rankingsRelation);
        candidate3 = election.candidates().createFromRemote({id: 3, body: "Candidate 3"});
        ranking3 = user.rankings().createFromRemote({id: 3, electionId: election.id(), candidateId: candidate3.id(), position: -128});

        expect(rankedCandidates.list.find('li').size()).toBe(4);
        expect(rankedCandidates.list.find('li').eq(0).view().ranking).toBe(ranking1);
        expect(rankedCandidates.list.find('li').eq(1)).toMatchSelector('#separator');
        expect(rankedCandidates.list.find('li').eq(2).view().ranking).toBe(ranking2);
        expect(rankedCandidates.list.find('li').eq(3).view().ranking).toBe(ranking3);
      });

      it("responds to a ranking inserted in a negative position other than the last", function() {
        rankedCandidates.rankings(rankingsRelation);
        candidate3 = election.candidates().createFromRemote({id: 3, body: "Candidate 3"});
        ranking3 = user.rankings().createFromRemote({id: 3, electionId: election.id(), candidateId: candidate3.id(), position: -32});

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
