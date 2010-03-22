_.constructor("Views.Candidate", View.Template, {
  content: function(params) { with(this.builder) {
    var candidate = params.candidate || params.ranking.candidate();
    li({'class': "candidate", candidateId: candidate.id()}, function() {
      div({'class': "unrankCandidate", style: "display: none;"})
        .ref('destroyRankingButton')
        .click('destroyRanking');
      span({'class': "candidateBody"}, candidate.body());
    });
  }},

  viewProperties: {
    propertyAccessors: ["candidate", "ranking"],

    ranking: {
      afterChange: function() {
        this.destroyRankingButton.show();
      }
    },

    destroyRanking: function() {
      this.ranking().destroy();
    }
  }
});