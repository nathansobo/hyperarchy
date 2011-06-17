_.constructor('Views.Pages.Election.RankingLi', Monarch.View.Template, {
  content: function(params) { with(this.builder) {
    li({'class': "ranking"});
  }},

  viewProperties: {
    initialize: function() {
      if (this.ranking) {
        this.candidate = this.ranking.candidate();
        this.observeRankingPosition();
      }
      this.text(this.candidate.body());
    },
    
    observeRankingPosition: function() {
      this.data('position', this.ranking.position());
      this.rankingUpdateSubscription = this.ranking.onUpdate(function() {
        this.data('position', this.ranking.position());
      }, this);
    },

    afterRemove: function() {
      if (this.rankingUpdateSubscription) this.rankingUpdateSubscription.destroy();
    },
    
    handleListDrop: function() {
      var candidate = this.candidate;

      var nextLi = this.next('li');
      var nextPosition = nextLi.data('position');

      var prevLi = this.prev('li');
      var prevPosition = prevLi.data('position');

      if (prevPosition === undefined) prevPosition = nextPosition + 128;
      if (nextPosition === undefined) nextPosition = prevPosition - 128;

      var position = (nextPosition + prevPosition) / 2;
      this.data('position', position);
      Ranking.createOrUpdate(Application.currentUser(), candidate, position)
        .success(function(ranking) {
          if (!this.ranking) {
            this.ranking = ranking;
            this.observeRankingPosition();
          }
        }, this);
    }
  }
});
