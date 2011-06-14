_.constructor('Views.Pages.Election.RankedCandidateLi', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div();
  }},

  viewProperties: {
    propertyAccessors: ['candidate'],

    initialize: function() {
      this.candidate(this.ranking.candidate());
    }
  }
});
