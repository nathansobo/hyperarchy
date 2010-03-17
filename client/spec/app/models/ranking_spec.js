//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Ranking", function() {
    useLocalFixtures();

    describe(".createOrUpdate(candidate, predecessor, successor)", function() {
      it("creates or updates the ranking for the candidate, with a position that places it between the predecessor and successor", function() {
        var user = User.find('nathan');
        var election = Election.find('menu');
        var a = Candidate.find('rice');
        var b = Candidate.find('fish');
        var c = Candidate.find('salad');

        Ranking.createOrUpdate(user, election, a, null, null).afterEvents(function(ranking) {
          expect(ranking.position()).to(equal, 1);
        });
        
        var bRanking;
        Ranking.createOrUpdate(user, election, b, a, null).afterEvents(function(ranking) {
          bRanking = ranking;
          expect(ranking.position()).to(equal, 2);
        });

        Ranking.createOrUpdate(user, election, c, a, b).afterEvents(function(ranking) {
          expect(ranking.position()).to(equal, 1.5);
        });

        Ranking.createOrUpdate(user, election, b, null, a).afterEvents(function(ranking) {
          console.debug(ranking.wireRepresentation(), bRanking.wireRepresentation());
          expect(ranking === bRanking).to(beTrue);
//          expect(ranking).to(equal, bRanking);
          expect(bRanking.position()).to(equal, 0.5);
        });
      });
    });
  });
}});
