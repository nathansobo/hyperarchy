//= require spec/spec_helper

describe("Views.Pages.Question.RankingLi", function() {
  var candidate, ranking, rankedCandidateLi;

  beforeEach(function() {
    attachLayout();
    candidate = Candidate.createFromRemote({id: 11, questionId: 22, body: "Fruitloops"});
    ranking = Ranking.createFromRemote({candidateId: candidate.id()});
  });

  describe("initialize", function() {
    it("assigns itself the candidate for the given ranking", function() {
      rankedCandidateLi = Views.Pages.Question.RankingLi.toView({ranking: ranking});
      expect(rankedCandidateLi.candidate).toEqual(candidate);
    });
  });
});