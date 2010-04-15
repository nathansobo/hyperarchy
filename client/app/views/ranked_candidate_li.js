_.constructor("Views.RankedCandidateLi", View.Template, {
  content: function(params) { with(this.builder) {
    var candidate = params.candidate || params.ranking.candidate();
    li({ candidateId: candidate.id(), 'class': "rankedCandidate" }, function() {
      div({'class': "candidateIcon loading", style: "display: none;"}).ref('loadingIcon');
      div({'class': "candidateIcon unrankCandidate", style: "display: none;"})
        .ref('destroyRankingButton')
        .click('destroyRanking');
      span({'class': "body"}, candidate.body());
    });
  }},

  viewProperties: {
    initialize: function() {
      if (!this.candidate) this.candidate = this.ranking.candidate();
      if (!this.ranking) this.ranking = this.candidate.rankingByCurrentUser().first();
    },

    startLoading: function() {
      this.loadingIcon.show();
      this.destroyRankingButton.hide();
    },

    stopLoading: function() {
      this.loadingIcon.hide();
      this.destroyRankingButton.show();
    },

    destroyRanking: function() {
      this.ranking.destroy();
    }
  }
});