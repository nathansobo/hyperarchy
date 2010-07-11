_.constructor("Views.RankedCandidatesList", View.Template, {
  content: function() { with(this.builder) {
    div(function() {
      div({'class': "candidatesListHeader"}, "Your Ranking");
      ol({id: "rankedCandidates", 'class': "candidates ranked"}, function() {

        li({'class': "separator glossyBlack"}, function() {
          div({'class': "up"}, "good ideas");
          div({'class': "down"}, "bad ideas");
        }).ref('separator');

      }).ref('rankedCandidatesList');
    });
  }},

  viewProperties: {
    initialize: function() {
      this.subscriptions = new Monarch.SubscriptionBundle();
      this.rankedCandidatesList.sortable({
        update: this.hitch('handleUpdate'),
        receive: this.hitch('handleReceive')
      });
      this.separator.mousedown(function(e) {
        return false;
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
      this.empty();
      this.rankings.each(function(ranking) {
        var li = Views.RankedCandidateLi.toView({ranking: ranking});
        li.stopLoading();

        if (ranking.position() > 0) {
          this.separator.before(li);
        } else {
          this.rankedCandidatesList.append(li);
        }
      }, this);
      this.subscriptions.add(this.rankings.onRemoteRemove(function(ranking) {
        this.findLi(ranking.candidate()).remove();
      }, this));
    },

    empty: function() {
      this.rankedCandidatesList.find("li:not(.separator)").remove();
    },

    handleReceive: function(event, ui) {
      var candidate = Candidate.find(ui.item.attr('candidateId'));
      var rankedCandidateView = Views.RankedCandidateLi.toView({candidate: candidate});
      this.findPreviousLi(candidate).remove(); // may have already been ranked
      this.findLi(candidate).replaceWith(rankedCandidateView); // replace the clone of the draggable li with a real view
    },

    handleUpdate: function(event, ui) {
      var candidate = Candidate.find(ui.item.attr('candidateId'));
      // received items are replaced with different object, so need to find from the list
      var rankedCandidateLi = this.findLi(candidate);
      rankedCandidateLi.view().startLoading();

      var belowSeparator = rankedCandidateLi.prevAll('.separator').length > 0;
      // the successor is higher in the list, the predecessor is lower
      var successorId = rankedCandidateLi.prev('.candidate').attr('candidateId');
      var predecessorId = rankedCandidateLi.next('.candidate').attr('candidateId');
      var predecessor = predecessorId ? Candidate.find(predecessorId) : null;
      var successor = successorId ? Candidate.find(successorId) : null;

      Ranking.createOrUpdate(Application.currentUser(), this.election(), candidate, predecessor, successor, belowSeparator)
        .onSuccess(function(ranking) {
          if (!ranking) debugger;
          rankedCandidateLi.view().ranking = ranking;
          rankedCandidateLi.view().stopLoading();
        });
    },

    findPreviousLi: function(candidate) {
      return this.rankedCandidatesList.find("li.ranked.candidate[candidateId='" + candidate.id() + "']");
    },

    findLi: function(candidate) {
      return this.rankedCandidatesList.find("li[candidateId='" + candidate.id() + "']");
    },

    adjustHeight: function() {
      this.rankedCandidatesList.height($(window).height() - this.rankedCandidatesList.offset().top - 20);
    }
  }
});