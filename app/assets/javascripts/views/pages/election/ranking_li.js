_.constructor('Views.Pages.Election.RankingLi', Monarch.View.Template, {
  content: function(params) { with(this.builder) {
    li(params.ranking.candidate().body());
  }},

  viewProperties: {
    propertyAccessors: ['candidate'],

    initialize: function() {
      this.candidate(this.ranking.candidate());
    }
  }
});
