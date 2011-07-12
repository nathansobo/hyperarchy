_.constructor('Views.Pages.Question.RankingLi', Monarch.View.Template, {
  content: function(params) { with(this.builder) {
    li({'class': "ranking"}, function() {
      subview('spinner', Views.Components.Spinner);
      div().ref('body');
    }).mousedown('handleMousedown');
  }},

  viewProperties: {
    initialize: function() {
      if (this.ranking) {
        this.answer = this.ranking.answer();
        this.observeRankingPosition();
      }
      this.body.markdown(this.answer.body());
      this.outstandingRequests = 0;
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
      var answer = this.answer;

      var nextLi = this.next('li');
      var nextPosition = nextLi.data('position');

      var prevLi = this.prev('li');
      var prevPosition = prevLi.data('position');

      if (prevPosition === undefined) prevPosition = nextPosition + 128;
      if (nextPosition === undefined) nextPosition = prevPosition - 128;

      var position = (nextPosition + prevPosition) / 2;
      this.data('position', position);

      this.loading(true);
      this.outstandingRequests++;
      Ranking.createOrUpdate(Application.currentUser(), answer, position)
        .success(function(ranking) {
          this.outstandingRequests--;
          if (this.outstandingRequests === 0) this.loading(false);
          if (!this.ranking) {
            this.ranking = ranking;
            this.observeRankingPosition();
          }
        }, this);
    },

    handleMousedown: function() {
      if (this.ranking && this.ranking.userId() !== Application.currentUserId()) return false;
    },

    loading: {
      change: function(loading) {
        if (loading) {
          this.spinner.show();
        } else {
          this.spinner.hide();
        }
      }
    }
  }
});
