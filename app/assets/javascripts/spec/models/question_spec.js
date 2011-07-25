//= require spec/spec_helper

describe("Question", function() {
  var creator, question, answer1, answer2, answer3, answer4;
  beforeEach(function() {
    creator = User.createFromRemote({id: 1, firstName: "Question", lastName: "Creator"});
    question = creator.questions().createFromRemote({id: 22, voteCount: 0, body: "What's your favorite color?"});
    answer1 = question.answers().createFromRemote({id: 1, body: "Red"});
    answer2 = question.answers().createFromRemote({id: 2, body: "Green"});
    answer3 = question.answers().createFromRemote({id: 3, body: "Blue"});
    answer4 = question.answers().createFromRemote({id: 4, body: "Yellow"});

    Question.SCORE_EXTRA_VOTES = 1;
    Question.SCORE_EXTRA_HOURS = 2;
    Question.SCORE_GRAVITY = 1.8;
  });


  describe("#shareOnFacebook", function() {
    var currentUser;

    beforeEach(function() {
      attachLayout();
      spyOn(FB, 'ui');
      spyOn(Application, 'randomString').andReturn('sharecode');

      currentUser = User.createFromRemote({id: 1, firstName: "John", lastName: "Smith"});
      Application.currentUser(currentUser);
    });
    
    describe("if the current user has no positive rankings for this question", function() {
      it("opens the share dialog with only the question and no description", function() {
        question.shareOnFacebook();

        expect(FB.ui).toHaveBeenCalled()
        var uiOptions = FB.ui.mostRecentCall.args[0];

        expect(uiOptions.method).toBe('feed');
        expect(uiOptions.name).toBe(question.body());
        expect(uiOptions.link).toBe(question.absoluteUrl() + "?s=sharecode");
        expect(uiOptions.caption).toBe(question.noRankingsShareCaption);
        expect(uiOptions.description).toBeUndefined();
      });
    });
    
    describe("if the current user has 1 positive ranking for this question ", function() {
      it("opens the share dialog with question and the appropriate plurality on the caption", function() {
        question.rankingsForCurrentUser().createFromRemote({answerId: answer1.id(), position: 64});

        question.shareOnFacebook();

        expect(FB.ui).toHaveBeenCalled()
        var uiOptions = FB.ui.mostRecentCall.args[0];

        expect(uiOptions.method).toBe('feed');
        expect(uiOptions.name).toBe(question.body());
        expect(uiOptions.link).toBe(question.absoluteUrl() + "?s=sharecode");
        expect(uiOptions.caption).toContain(currentUser.fullName());
        expect(uiOptions.caption).toContain("answer");
        expect(uiOptions.caption).not.toContain("answers");
        expect(uiOptions.description).toContain(answer1.body());
      });
    });
    
    describe("if the current user has more than 3 positive rankings for this question", function() {
      it("opens the share dialog, only including the first 3 answers in the descriptions", function() {
        question.rankingsForCurrentUser().createFromRemote({answerId: answer1.id(), position: 300});
        question.rankingsForCurrentUser().createFromRemote({answerId: answer2.id(), position: 200});
        question.rankingsForCurrentUser().createFromRemote({answerId: answer3.id(), position: 100});
        question.rankingsForCurrentUser().createFromRemote({answerId: answer4.id(), position: 50});

        question.shareOnFacebook();
        expect(FB.ui).toHaveBeenCalled()

        var uiOptions = FB.ui.mostRecentCall.args[0];

        expect(uiOptions.method).toBe('feed');
        expect(uiOptions.name).toBe(question.body());
        expect(uiOptions.link).toBe(question.absoluteUrl() + "?s=sharecode");
        expect(uiOptions.caption).toContain(currentUser.fullName());
        expect(uiOptions.caption).toContain("answers");
        expect(uiOptions.description).toContain(answer1.body());
        expect(uiOptions.description).toContain(answer2.body());
        expect(uiOptions.description).toContain(answer3.body());
        expect(uiOptions.description).not.toContain(answer4.body());
      });
    });

    describe("mixpanel / virality tracking", function() {
      var callback;
      beforeEach(function() {
        question.shareOnFacebook();
        callback = FB.ui.mostRecentCall.args[1];
        mpq = [];
      });

      describe("when the user shares to their wall successfully", function() {
        it("pushes a 'Facebook Post' event and records a share event", function() {
          callback({post_id: 1});
          expect(mpq.pop()).toEqual(['track', 'Facebook Post', question.mixpanelProperties()]);

          expect($.ajax).toHaveBeenCalled();
          expect(mostRecentAjaxRequest.type).toBe("post");
          expect(mostRecentAjaxRequest.url).toBe("/shares");
          expect(mostRecentAjaxRequest.data).toEqual({question_id: question.id(), service: "facebook", code: "sharecode"});
        });
      });

      describe("when the user cancels the share", function() {
        it("pushes a 'Cancel Facebook Post'", function() {
          callback({});
          expect(mpq.pop()).toEqual(['track', 'Cancel Facebook Post', question.mixpanelProperties()]);
        });
      });
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

  describe("#absoluteUrl", function() {
    it("appends the Application.origin to the url", function() {
      spyOn(Application, 'origin').andReturn('https://hyperarchy.com')
      expect(question.absoluteUrl()).toBe('https://hyperarchy.com/questions/22');
    });
  });

  describe("#url", function() {
    it("returns the correct url", function() {
      expect(question.url()).toEqual('/questions/22');
    });
  });
});
