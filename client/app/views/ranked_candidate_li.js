_.constructor("Views.RankedCandidateLi", View.Template, {
  content: function(params) { with(this.builder) {
    var candidate = params.candidate || params.ranking.candidate();
    li({ candidateId: candidate.id(), 'class': "rankedCandidate" }, function() {
      div({'class': "candidateIcon unrankCandidate", style: "display: none;"})
        .ref('destroyRankingButton')
        .click('destroyRanking');
      span(candidate.body());
    });
  }},

  viewProperties: {
    ranking: {
      afterChange: function(ranking) {
        if (!ranking) return;
        this.destroyRankingButton.show();
      }
    },

    destroyRanking: function() {
      this.ranking().destroy();
    }
  }
});