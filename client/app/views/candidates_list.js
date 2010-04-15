_.constructor("Views.CandidatesList", View.Template, {
  content: function() { with(this.builder) {
    div(function() {
      div({'class': "sectionLabel"}, "Current Consensus");
      ol({id: "candidates", 'class': "candidates"}).ref('candidatesList');
    });
  }},

  viewProperties: {
    initialize: function() {
      this.candidatesSubscriptions = new Monarch.SubscriptionBundle();
    },

    election: {
      afterChange: function(election) {
        this.candidatesSubscriptions.destroyAll();
        this.populateCandidates();
        this.candidatesSubscriptions.add(election.candidates().onRemoteInsert(this.hitch('addCandidateToList')));
      }
    },

    populateCandidates: function() {
      this.candidatesList.empty();
      this.election().candidates().each(this.hitch('addCandidateToList'));
    },

    addCandidateToList: function(candidate) {
      this.candidatesList.append(Views.CandidateLi.toView({candidate: candidate}));
    }
  }
});
