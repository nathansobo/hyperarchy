_.constructor("Views.RankedCandidateLi", Views.CandidateLi, {
  content: function($super, params) {
    if (!params.candidate) params.candidate = params.ranking.candidate();
    $super(params);
  },

  additionalClass: "ranked",

  candidateIcon: function() { with(this.builder) {
    div({'class': "candidateIcon unrankCandidate", style: "display: none;"})
      .ref('destroyRankingButton')
      .click('destroyRanking');
  }},

  viewProperties: {
    initialize: function($super, alreadyLoaded) {
      $super();
      if (!this.candidate) this.candidate = this.ranking.candidate();
      if (!this.ranking) this.ranking = this.candidate.rankingByCurrentUser().first();
      if (this.ranking) this.rankingPosition = this.ranking.position();
      this.subscriptions.add(this.candidate.onDestroy(function() {
        this.remove();
      }, this));
    },

    handleUpdate: function() {
      this.containingList.showOrHideDragTargetExplanations();
      this.startLoading();
      var rankingPosition = this.determineRankingPosition();
      this.rankingPosition = rankingPosition;
      Ranking.createOrUpdate(Application.currentUser(), this.candidate, this.rankingPosition)
        .onSuccess(function(ranking) {
          this.ranking = ranking;
          if (rankingPosition === this.rankingPosition) this.stopLoading();
        }, this);
    },

    determineRankingPosition: function() {
      var belowSeparator = this.prevAll('.separator').length > 0;
      var successor = this.prevAll('.candidate:first, .separator').view();
      var predecessor = this.nextAll('.candidate:first, .separator').view();
      var successorPosition = successor ? successor.rankingPosition : null;
      var predecessorPosition = predecessor ? predecessor.rankingPosition : null;

      if (belowSeparator) {
        if (!successorPosition) successorPosition = 0;
        if (!predecessorPosition) predecessorPosition = successorPosition - 128;
      } else {
        if (!predecessorPosition) predecessorPosition = 0;
        if (!successorPosition) successorPosition = predecessorPosition + 128;
      }

      return (predecessorPosition + successorPosition) / 2;
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
      this.startLoading();
      this.ranking.destroy();
    },

    afterRemove: function() {
      this.containingList.showOrHideDragTargetExplanations();
    }
  }
});