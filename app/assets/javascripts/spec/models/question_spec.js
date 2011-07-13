//= require spec/spec_helper

describe("Question", function() {
  var creator, question;
  beforeEach(function() {
    creator = User.createFromRemote({id: 1, firstName: "Question", lastName: "Creator"});
    question = creator.questions().createFromRemote({id: 22, voteCount: 0})
    Question.SCORE_EXTRA_VOTES = 1;
    Question.SCORE_EXTRA_HOURS = 2;
    Question.SCORE_GRAVITY = 1.8;
  });


  describe("#shareOnFacebook", function() {
    beforeEach(function() {
      attachLayout();
    });
    
    it("performs a graph api request with the question's body and url", function() {
      spyOn(FB, 'api');
      question.shareOnFacebook();
      expect(FB.api).toHaveBeenCalled();
      var args = FB.api.mostRecentCall.args;
      expect(args[0]).toBe('/me/feed');
      expect(args[1]).toBe('post');
      var params = args[2];
      expect(params.message).toBe(question.body());
      expect(params.name).toContain(creator.fullName());
      expect(params.link).toBe(question.absoluteUrl());
    });
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
