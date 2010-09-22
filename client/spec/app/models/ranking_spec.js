//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Ranking", function() {
    useLocalFixtures();

    describe(".createOrUpdate(candidate, predecessor, successor)", function() {
      it("posts to /rankings with a position that places the ranked candidate between the predecessor and successor and with the correct sign", function() {
        Ranking.table.clear();

        var user = User.fixture('nathan');
        var election = Election.fixture('menu');
        var a = Candidate.fixture('rice');
        var b = Candidate.fixture('fish');
        var c = Candidate.fixture('salad');
        var aRanking, bRanking, cRanking;
        var callback = mockFunction("callback");

        Ranking.createOrUpdate(user, election, a, null, null, false).onSuccess(callback);
        expect(Server.posts.length).to(eq, 1);
        expect(Server.lastPost.data).to(equal, {
          user_id: user.id(),
          election_id: election.id(),
          candidate_id: a.id(),
          position: 64
        });

        Server.lastPost.simulateSuccess({ranking_id: 1}, {
          rankings: {
            1: {
              user_id: user.id(),
              election_id: election.id(),
              candidate_id: a.id(),
              position: 64
            }
          }
        });

        expect(callback).to(haveBeenCalled, withArgs(Ranking.find(1)));



        var bRanking;
        Ranking.createOrUpdate(user, election, b, null, a, false).afterEvents(function(ranking) {
          bRanking = ranking;
          expect(ranking.position()).to(eq, 32);
        });

        Ranking.createOrUpdate(user, election, c, b, a, false).afterEvents(function(ranking) {
          cRanking = ranking;
          expect(ranking.position()).to(eq, 48);
        });

        Ranking.createOrUpdate(user, election, b, a, null, false).afterEvents(function(ranking) {
          expect(ranking).to(eq, bRanking);
          expect(ranking.position()).to(eq, 128);
        });

        // now move rankings below the separator

        Ranking.createOrUpdate(user, election, b, null, null, true).afterEvents(function(ranking) {
          expect(ranking).to(eq, bRanking);
          expect(ranking.position()).to(eq, -64);
        });

        Ranking.createOrUpdate(user, election, a, null, b, true).afterEvents(function(ranking) {
          expect(ranking).to(eq, aRanking);
          expect(ranking.position()).to(eq, -128);
        });

        Ranking.createOrUpdate(user, election, c, a, b, true).afterEvents(function(ranking) {
          expect(ranking).to(eq, cRanking);
          expect(ranking.position()).to(eq, -96);
        });
      });
    });
  });
}});
