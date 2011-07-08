//= require spec/spec_helper

describe("Question", function() {
  var question;
  beforeEach(function() {
    question = Question.createFromRemote({id: 22, voteCount: 0})
    Question.SCORE_EXTRA_VOTES = 1;
    Question.SCORE_EXTRA_HOURS = 2;
    Question.SCORE_GRAVITY = 1.8;
  });

  describe("#updateScore", function() {
    it("decreases the score as time passes and increases it as votes are added", function() {
      freezeTime();
      question.remotelyUpdated({createdAt: new Date()});
      question.updateScore();

      var score1 = question.score();
      jump(3600000);

      question.updateScore();
      var score2 = question.score();
      expect(score2).toBeLessThan(score1);

      question.remotelyUpdated({voteCount: 5});
      question.updateScore();
      var score3 = question.score();
      expect(score3).toBeGreaterThan(score2);

      jump(3600000);
      question.updateScore();
      var score4 = question.score();
      expect(score4).toBeLessThan(score3);
    });
  });

  describe("#url", function() {
    it("returns the correct url", function() {
      expect(question.url()).toEqual('/questions/22');
    });
  });
});
