//= require spec/spec_helper

describe("Election", function() {
  var election;
  beforeEach(function() {
    election = Election.createFromRemote({id: 22, voteCount: 0})
    Election.SCORE_EXTRA_VOTES = 1;
    Election.SCORE_EXTRA_HOURS = 2;
    Election.SCORE_GRAVITY = 1.8;
  });

  describe("#updateScore", function() {
    it("decreases the score as time passes and increases it as votes are added", function() {
      freezeTime();
      election.remotelyUpdated({createdAt: new Date()});
      election.updateScore();

      var score1 = election.score();
      jump(3600000);

      election.updateScore();
      var score2 = election.score();
      expect(score2).toBeLessThan(score1);

      election.remotelyUpdated({voteCount: 5});
      election.updateScore();
      var score3 = election.score();
      expect(score3).toBeGreaterThan(score2);

      jump(3600000);
      election.updateScore();
      var score4 = election.score();
      expect(score4).toBeLessThan(score3);
    });
  });

  describe("#url", function() {
    it("returns the correct url", function() {
      expect(election.url()).toEqual('/elections/22');
    });
  });
});
