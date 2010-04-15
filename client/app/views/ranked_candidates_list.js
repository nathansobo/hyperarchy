_.constructor("Views.RankedCandidatesList", View.Template, {
  content: function() { with(this.builder) {
    div(function() {
      div({'class': "sectionLabel"}, "Your Ranking");
      ol({id: "rankedCandidates", 'class': "candidates ranked"}).ref('rankedCandidatesList');
    });
  }},

  viewProperties: {
    initialize: function() {
      this.subscriptions = new Monarch.SubscriptionBundle();
      this.rankedCandidatesList.sortable({
        update: this.hitch('handleUpdate'),
        receive: this.hitch('handleReceive')
      });
    },

    election: {
      afterChange: function(election) {
        this.subscriptions.destroyAll();
        this.rankings = election.rankingsForCurrentUser();
        this.populateRankings();
      }
    },

    populateRankings: function() {
      this.rankedCandidatesList.empty();
      this.rankings.each(function(ranking) {
        this.rankedCandidatesList.append(Views.RankedCandidateLi.toView({ranking: ranking}));
      }, this);
      this.subscriptions.add(this.rankings.onRemoteRemove(function(ranking) {
        this.findLi(ranking.candidate()).remove();
      }, this));
    },

    handleReceive: function(event, ui) {
      var candidate = Candidate.find(ui.item.attr('candidateId'));
      var rankedCandidateView = Views.RankedCandidateLi.toView({candidate: candidate});
      this.findPreviousLi(candidate).remove();
      this.findLi(candidate).replaceWith(rankedCandidateView);
    },

    handleUpdate: function(event, ui) {
      // received items are replaced with different object, so need to find from the list
      var candidate = Candidate.find(ui.item.attr('candidateId'));
      var rankedCandidateLi = this.findLi(candidate);

      var predecessorId = rankedCandidateLi.prev().attr('candidateId');
      var successorId = rankedCandidateLi.next().attr('candidateId');
      var predecessor = predecessorId ? Candidate.find(predecessorId) : null;
      var successor = successorId ? Candidate.find(successorId) : null;

      Ranking.createOrUpdate(Application.currentUser(), this.election(), candidate, predecessor, successor)
        .onSuccess(function(ranking) {
          rankedCandidateLi.view().ranking(ranking);
        });
    },

    findPreviousLi: function(candidate) {
      return this.rankedCandidatesList.find("li.rankedCandidate[candidateId='" + candidate.id() + "']");
    },

    findLi: function(candidate) {
      return this.rankedCandidatesList.find("li[candidateId='" + candidate.id() + "']");
    }
  }
});