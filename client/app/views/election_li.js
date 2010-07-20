_.constructor("Views.ElectionLi", View.Template, {
  content: function(params) { with(this.builder) {
    var election = params.election;

    li({'class': "grid6"}, function() {
      div({'class': "election"}, function() {
        div({'class': "body"}, election.body());

        ol({'class': "candidates"}, function() {
          election.candidates().each(function(candidate) {
            li(candidate.body());
          });
        });

        div({'class': "fadeOut"});
      }).click('displayElection');
    });
  }},

  viewProperties: {
    initialize: function() {
      this.election.candidates().onRemoteUpdate(this.hitch());
    },

    insertCandidate: function(candidate, index) {
      var candidateLi = Views.CandidateLi.toView({candidate: candidate});
      this.insertAtIndex(candidateLi, index)
    },

    updateCandidate: function(candidate, changes, index) {
      var candidateLi = this.findLi(candidate);
      this.insertAtIndex(candidateLi, index);
    },

    displayElection: function() {
      $.bbq.pushState({view: "election", electionId: this.election.id()});
    }
  }
});