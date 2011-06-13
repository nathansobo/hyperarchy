_.constructor('Views.Pages.Election.CurrentConsensus', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div(function() {
      h2("Current Consensus");
      subview('list', Views.Components.SortedList, {
        buildElement: function(candidate) {
          return Views.Pages.Election.CandidateLi.toView({candidate: candidate});
        }
      });
    })
  }},

  viewProperties: {
    candidates: {
      change: function(candidates) {
        return candidates.fetch().success(function() {
          this.list.relation(candidates);
        }, this);
      }
    }
  }
});
