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
      var adjustHeight = this.hitch('adjustHeight');
      _.defer(adjustHeight);
      $(window).resize(adjustHeight);
    },

    election: {
      afterChange: function(election) {
        this.candidatesSubscriptions.destroy();
        this.populateCandidates();
        this.candidatesSubscriptions.add(election.candidates().onRemoteInsert(this.hitch('addCandidateToList')));
        this.candidatesSubscriptions.add(election.candidates().onRemoteUpdate(this.hitch('updateCandidate')))
      }
    },

    populateCandidates: function() {
      this.candidatesList.empty();
      this.election().candidates().each(this.hitch('addCandidateToList'));
    },

    addCandidateToList: function(candidate) {
      console.debug(candidate.wireRepresentation());
      this.candidatesList.append(Views.CandidateLi.toView({candidate: candidate}));
    },

    updateCandidate: function(candidate, changes) {
      console.debug(candidate.wireRepresentation());
      console.debug(changes);
    },

    empty: function() {
      this.candidatesList.empty();
    },

    adjustHeight: function() {
      this.candidatesList.height($(window).height() - this.candidatesList.offset().top - 20); 
    }
  }
});
