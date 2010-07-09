_.constructor("Views.CandidatesList", View.Template, {
  content: function() { with(this.builder) {
    div(function() {
      div({'class': "candidatesListHeader"}, "Current Consensus");
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
        this.candidatesSubscriptions.add(election.candidates().onRemoteInsert(this.hitch('insertCandidate')));
        this.candidatesSubscriptions.add(election.candidates().onRemoteUpdate(this.hitch('updateCandidate')))
      }
    },

    populateCandidates: function() {
      this.candidatesList.empty();
      this.election().candidates().each(this.hitch('insertCandidate'));
    },

    insertCandidate: function(candidate, index) {
      var candidateLi = Views.CandidateLi.toView({candidate: candidate});
      this.insertAtIndex(candidateLi, index)
    },

    updateCandidate: function(candidate, changes, index) {
      var candidateLi = this.findLi(candidate);
      this.insertAtIndex(candidateLi, index);
    },

    insertAtIndex: function(candidateLi, index) {
      candidateLi.detach();

      var insertBefore = this.candidatesList.find("li").eq(index);
      if (insertBefore.length > 0) {
        insertBefore.before(candidateLi);
      } else {
        this.candidatesList.append(candidateLi);
      }
    },

    findLi: function(candidate) {
      return this.candidatesList.find("li[candidateId='" + candidate.id() + "']");
    },

    empty: function() {
      this.candidatesList.empty();
    },

    adjustHeight: function() {
      this.candidatesList.height($(window).height() - this.candidatesList.offset().top - 20); 
    }
  }
});
