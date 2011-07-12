//= require spec/spec_helper

describe("Views.Pages.Question.CurrentConsensus", function() {
  var currentConsensusView, question, answer1, answer2, user1;

  beforeEach(function() {
    attachLayout();
    currentConsensusView = Application.questionPage.currentConsensus;
    $('#jasmine_content').append(currentConsensusView);

    question = Question.createFromRemote({id: 1});
    answer1 = question.answers().createFromRemote({id: 1, body: "Cheese", position: 1});
    answer2 = question.answers().createFromRemote({id: 2, body: "Goats", position: 2});

    user1 = User.createFromRemote({id: 1});
    Application.currentUser(user1);
  });


  describe("with the answers relation assigned", function() {
    beforeEach(function() {
      currentConsensusView.answers(question.answers());
    });

    describe("when the selectedAnswer is changed", function() {
      it("adds the .selected class on the selected answer's li and removes it from any others", function() {
        currentConsensusView.selectedAnswer(answer1);
        expect(currentConsensusView).toContain('li.selected:contains("' + answer1.body() + '")');

        currentConsensusView.selectedAnswer(answer2);

        expect(currentConsensusView).toContain('li.selected:contains("' + answer2.body() + '")');
        expect(currentConsensusView).not.toContain('li.selected:contains("' + answer1.body() + '")');

        currentConsensusView.selectedAnswer(null);
        expect(currentConsensusView).not.toContain('li.selected');
      });
    });

    describe("when the position of a answer changes", function() {
      it("updates the position on the answer li", function() {
        var answer1Li = currentConsensusView.find('li:contains("' + answer1.body() + '")').view();
        var answer2Li = currentConsensusView.find('li:contains("' + answer2.body() + '")').view();

        expect(answer1Li.position.text()).toBe("1");
        expect(answer2Li.position.text()).toBe("2");

        answer1.remotelyUpdated({position: 2});
        answer2.remotelyUpdated({position: 1});

        expect(answer1Li.position.text()).toBe("2");
        expect(answer2Li.position.text()).toBe("1");
      });
    });

    describe("when the body of a answer changes", function()  {
      it("updates the body in the answer li", function() {
        var answer1Li = currentConsensusView.find('li:contains("' + answer1.body() + '")').view();

        expect(answer1Li.body.html()).toBe($.markdown(answer1.body()));

        answer1.remotelyUpdated({body: 'rockets!'});

        expect(answer1Li.body.html()).toBe($.markdown(answer1.body()));
      });
    });
  });

  describe("icons", function() {
    var user2, answer3, answer1Li, answer2Li, answer3Li;

    beforeEach(function() {
      answer3 = question.answers().createFromRemote({id: 3, body: "Deer", position: 3});
      user2 = User.createFromRemote({id: 2});
      user1.rankingsForQuestion(question).createFromRemote({answerId: answer1.id(), position: 64});
      user1.rankingsForQuestion(question).createFromRemote({answerId: answer2.id(), position: -64});
      user2.rankingsForQuestion(question).createFromRemote({answerId: answer2.id(), position: 64});
      user2.rankingsForQuestion(question).createFromRemote({answerId: answer3.id(), position: -64});

      answer1.remotelyUpdated({commentCount: 1});
      answer2.remotelyUpdated({details: "Arcata's full of nimby cryers"});

      currentConsensusView.answers(question.answers());
      answer1Li = currentConsensusView.list.elementForRecord(answer1);
      answer2Li = currentConsensusView.list.elementForRecord(answer2);
      answer3Li = currentConsensusView.list.elementForRecord(answer3);
    });

    describe("ranking status of the answer lis", function() {
      describe("when the answers relation is assigned", function() {
        it("assigns the ranking statuses of the answers to reflect the new user's rankings", function() {
          expect(answer1Li.status).toHaveClass('positive');
          expect(answer1Li.status).not.toHaveClass('negative');
          expect(answer2Li.status).not.toHaveClass('positive');
          expect(answer2Li.status).toHaveClass('negative');
          expect(answer3Li.status).not.toHaveClass('positive');
          expect(answer3Li.status).not.toHaveClass('negative');
        });
      });

      describe("when the current user changes", function() {
        it("updates the ranking statuses of the answers to reflect the new user's rankings", function() {
          Application.currentUser(user2);

          expect(answer1Li.status).not.toHaveClass('positive');
          expect(answer1Li.status).not.toHaveClass('negative');
          expect(answer2Li.status).toHaveClass('positive');
          expect(answer2Li.status).not.toHaveClass('negative');
          expect(answer3Li.status).not.toHaveClass('positive');
          expect(answer3Li.status).toHaveClass('negative');
        });

        it("listens for updates to the new user's rankings", function() {
          Application.currentUser(user2);

          user2.rankings().createFromRemote({answerId: answer1.id(), position: -128});
          user2.rankings().find({answerId: answer2.id()}).remotelyDestroyed();
          user2.rankings().find({answerId: answer3.id()}).remotelyUpdated({position: 128});

          expect(answer1Li.status).not.toHaveClass('positive');
          expect(answer1Li.status).toHaveClass('negative');
          expect(answer2Li.status).not.toHaveClass('positive');
          expect(answer2Li.status).not.toHaveClass('negative');
          expect(answer3Li.status).toHaveClass('positive');
          expect(answer3Li.status).not.toHaveClass('negative');
        });
      });

      describe("when the current user creates, updates or destroys rankings for these answers", function() {
        it("updates the ranking statuses of the answers to reflect the new user's rankings", function() {
          user1.rankings().find({answerId: answer1.id()}).remotelyUpdated({position: -128});
          user1.rankings().find({answerId: answer2.id()}).remotelyDestroyed();
          user1.rankings().createFromRemote({answerId: answer3.id(), position: 128});

          expect(answer1Li.status).not.toHaveClass('positive');
          expect(answer1Li.status).toHaveClass('negative');
          expect(answer2Li.status).not.toHaveClass('positive');
          expect(answer2Li.status).not.toHaveClass('negative');
          expect(answer3Li.status).toHaveClass('positive');
          expect(answer3Li.status).not.toHaveClass('negative');
        });
      });

      describe("when a ranking is destroyed *AFTER* its answer is destroyed", function() {
        it("does not raise an exception trying to access the missing answer", function() {
          var ranking = user1.rankings().first();
          ranking.answer().remotelyDestroyed();
          ranking.remotelyDestroyed();
        });
      });
    });

    describe("showing and hiding of the ellipsis", function() {
      describe("when the answers relation is assigned", function() {
        it("shows the ellipsis for only those answers that have details or comments", function() {
          expect(answer1Li.ellipsis).toBeVisible();
          expect(answer2Li.ellipsis).toBeVisible();
          expect(answer3Li.ellipsis).not.toBeVisible();
        });
      });

      describe("when answers' details are updated", function() {
        it("shows the ellipsis for only those answers that have details or comments", function() {
          answer2.remotelyUpdated({details: ""});
          answer3.remotelyUpdated({details: "Deer always die in car accidents."});

          expect(answer1Li.ellipsis).toBeVisible();
          expect(answer2Li.ellipsis).not.toBeVisible();
          expect(answer3Li.ellipsis).toBeVisible();
        });
      });

      describe("when answer comments are created or removed", function() {
        it("shows the ellipsis for only those answers that have details or comments", function() {
          answer1.remotelyUpdated({commentCount: 0});
          answer3.remotelyUpdated({commentCount: 1});

          expect(answer1Li.ellipsis).not.toBeVisible();
          expect(answer2Li.ellipsis).toBeVisible();
          expect(answer3Li.ellipsis).toBeVisible();
        });
      });
    });
  });
});
