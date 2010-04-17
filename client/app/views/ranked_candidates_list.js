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
      var adjustHeight = this.hitch('adjustHeight');
      _.defer(adjustHeight);
      $(window).resize(adjustHeight);
    },

    election: {
      afterChange: function(election) {
        this.subscriptions.destroy();
        this.rankings = election.rankingsForCurrentUser();
        this.populateRankings();
      }
    },

    populateRankings: function() {
      this.rankedCandidatesList.empty();
      this.rankings.each(function(ranking) {
        var li = Views.RankedCandidateLi.toView({ranking: ranking});
        li.stopLoading();
        this.rankedCandidatesList.append(li);
      }, this);
      this.subscriptions.add(this.rankings.onRemoteRemove(function(ranking) {
        this.findLi(ranking.candidate()).remove();
      }, this));
    },

    handleReceive: function(event, ui) {
      var candidate = Candidate.find(ui.item.attr('candidateId'));
      var rankedCandidateView = Views.RankedCandidateLi.toView({candidate: candidate});
      this.findPreviousLi(candidate).remove(); // may have already been ranked
      this.findLi(candidate).replaceWith(rankedCandidateView); // replace the clone of the draggable li with a real view
    },

    handleUpdate: function(event, ui) {
      // received items are replaced with different object, so need to find from the list
      var candidate = Candidate.find(ui.item.attr('candidateId'));
      var rankedCandidateLi = this.findLi(candidate);
      rankedCandidateLi.view().startLoading();

      var predecessorId = rankedCandidateLi.prev().attr('candidateId');
      var successorId = rankedCandidateLi.next().attr('candidateId');
      var predecessor = predecessorId ? Candidate.find(predecessorId) : null;
      var successor = successorId ? Candidate.find(successorId) : null;

      Ranking.createOrUpdate(Application.currentUser(), this.election(), candidate, predecessor, successor)
        .onSuccess(function(ranking) {
          if (!ranking) debugger;
          console.debug("assigning ranking for " + ranking.candidate().body());
          rankedCandidateLi.view().ranking = ranking;
          rankedCandidateLi.view().stopLoading();
        });
    },

    findPreviousLi: function(candidate) {
      return this.rankedCandidatesList.find("li.rankedCandidate[candidateId='" + candidate.id() + "']");
    },

    findLi: function(candidate) {
      return this.rankedCandidatesList.find("li[candidateId='" + candidate.id() + "']");
    },

    adjustHeight: function() {
      this.rankedCandidatesList.height($(window).height() - this.rankedCandidatesList.offset().top - 20); 
    }
  }
});