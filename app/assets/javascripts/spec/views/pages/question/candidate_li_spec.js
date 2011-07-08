//= require spec/spec_helper

describe("Views.Pages.Question.CandidateLi", function() {
  var question, candidate, candidateLi;

  beforeEach(function() {
    attachLayout();
    Application.currentUser(User.createFromRemote({id: 1}));

    question = Question.createFromRemote({id: 22, creatorId: 1, createdAt: 234});
    candidate = question.candidates().createFromRemote({id: 11, body: "Fruitloops"});
    candidateLi = Views.Pages.Question.CandidateLi.toView({candidate: candidate});
  });

  describe("when clicked", function() {
    it("navigates to the candidate's url", function() {
      spyOn(Application, 'showPage');
      candidateLi.click();
      expect(Path.routes.current).toBe(candidate.url());
    });
  });

  describe("#handleDragStart (having trouble simulating it getting called without triggering the click handler)", function() {
    it("navigates to the question's bare url to cause the user's rankings to be revealed", function() {
      candidateLi.handleDragStart();
      expect(Path.routes.current).toBe(question.url());
    });
  });
});
