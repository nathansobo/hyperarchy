//= require spec/spec_helper

describe("Views.Pages.Organization.QuestionLi", function() {
  var questionLi, creator, question, answer1, answer2, answer1Li, answer2Li;
  beforeEach(function() {
    attachLayout();
    creator = User.createFromRemote({id: 1, emailHash: "email-hash"});
    question = Question.createFromRemote({id: 1, body: "What's your favorite color?", creatorId: creator.id()});
    answer1 = question.answers().createFromRemote({id: 1, body: "Red", position: 1});
    answer2 = question.answers().createFromRemote({id: 2, body: "Blue", position: 2});
    questionLi = Views.Pages.Organization.QuestionLi.toView({question: question});
    answer1Li = questionLi.find('li:contains("Red")').view();
    answer2Li = questionLi.find('li:contains("Blue")').view();
  });

  describe("#initialize", function() {
    it("assigns the body, answers, answer positions, and creator avatar", function() {
      expect(questionLi.avatar.user()).toBe(creator);
      expect(questionLi.body.text()).toBe(question.body());
      expect(questionLi.answers.relation().tuples()).toEqual(question.answers().tuples());
      expect(answer1Li.position.text()).toBe('1');
      expect(answer2Li.position.text()).toBe('2');
    });
  });

  describe("when the position of answers change", function() {
    it("updates the position number on the answer li", function() {
      expect(answer1Li.position.text()).toBe('1');
      expect(answer2Li.position.text()).toBe('2');

      answer1.remotelyUpdated({position: 2});
      answer2.remotelyUpdated({position: 1});

      expect(answer2Li.position.text()).toBe('1');
      expect(answer1Li.position.text()).toBe('2');
    });
  });
});
