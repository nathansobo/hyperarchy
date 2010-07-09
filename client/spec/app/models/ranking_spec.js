//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Ranking", function() {
    useLocalFixtures();

    describe(".createOrUpdate(candidate, predecessor, successor)", function() {
      it("creates or updates the ranking for the candidate, with a position that places it between the predecessor and successor and with the correct sign", function() {
        Ranking.table.clear();

        var user = User.fixture('nathan');
        var election = Election.fixture('menu');
        var a = Candidate.fixture('rice');
        var b = Candidate.fixture('fish');
        var c = Candidate.fixture('salad');

        Ranking.createOrUpdate(user, election, a, null, null, false).afterEvents(function(ranking) {
          expect(ranking.position()).to(eq, 64);
        });
        
        var bRanking;
        Ranking.createOrUpdate(user, election, b, null, a, false).afterEvents(function(ranking) {
          bRanking = ranking;
          expect(ranking.position()).to(eq, 32);
        });

        Ranking.createOrUpdate(user, election, c, b, a, false).afterEvents(function(ranking) {
          expect(ranking.position()).to(eq, 48);
        });

        Ranking.createOrUpdate(user, election, b, a, null, false).afterEvents(function(ranking) {
          expect(ranking).to(eq, bRanking);
          expect(bRanking.position()).to(eq, 128);
        });
      });
    });
  });
}});
