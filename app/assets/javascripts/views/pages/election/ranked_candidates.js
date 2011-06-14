_.constructor('Views.Pages.Election.RankedCandidates', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div(function() {
      ol().ref('list')
    });
  }},

  viewProperties: {
    rankings: {
      change: function(rankingsRelation) {
      }
    }
  }
});
