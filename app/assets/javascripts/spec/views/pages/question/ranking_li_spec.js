describe("Views.Pages.Question.RankingLi", function() {
  var answer, ranking, rankedAnswerLi;

  beforeEach(function() {
    attachLayout();
    answer = Answer.createFromRemote({id: 11, questionId: 22, body: "Fruitloops"});
    ranking = Ranking.createFromRemote({answerId: answer.id()});
  });

  describe("initialize", function() {
    it("assigns itself the answer for the given ranking", function() {
      rankedAnswerLi = Views.Pages.Question.RankingLi.toView({ranking: ranking});
      expect(rankedAnswerLi.answer).toEqual(answer);
    });
  });
});
