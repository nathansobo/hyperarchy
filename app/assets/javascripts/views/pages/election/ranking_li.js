_.constructor('Views.Pages.Election.RankingLi', Monarch.View.Template, {
  content: function(params) { with(this.builder) {
    li(params.ranking.candidate().body());
  }},

  viewProperties: {
    propertyAccessors: ['candidate'],

    initialize: function() {
      this.data('position', this.ranking.position());
      this.ranking.onUpdate(function() {
        this.data('position', this.ranking.position());
      }, this);
      this.candidate(this.ranking.candidate());
    }
  }
});
