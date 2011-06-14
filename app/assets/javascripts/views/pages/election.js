_.constructor('Views.Pages.Election', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "election"}, function() {
      div(function() {
        div({'class': 'body'}).ref('body');
      });
      div(function() {
        subview('currentConsensus', Views.Pages.Election.CurrentConsensus);
      });
      div(function() {
        subview('candidateDetails', Views.Pages.Election.CandidateDetails);
      });
      div();
    });
  }},

  viewProperties: {

    initialize: function() {
      this.currentConsensus.candidateDetails = this.candidateDetails;
    },

    id: {
      change: function(id) {
        this.currentConsensus.electionId(id);
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
      }
    }
  }
});
