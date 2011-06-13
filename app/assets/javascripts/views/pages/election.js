_.constructor('Views.Pages.Election', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "election"}, function() {
      div(function() {
        div({'class': 'body'}).ref('body');
      });
      div(function() {
        subview('currentConsensus', Views.Pages.Election.CurrentConsensus)
      });
      div();
      div();
    });
  }},

  viewProperties: {
    id: {
      change: function(id) {
        return Election.findOrFetch(id)
          .success(this.hitch('election'))
          .invalid(function() {
            History.pushState(null, null, Application.currentUser().defaultOrganization().url());
          });
      }
    },

    election: {
      change: function(election) {
        this.id(election.id());
        this.body.bindText(election, 'body');
        this.currentConsensus.candidates(election.candidates());
      }
    }
  }
});
