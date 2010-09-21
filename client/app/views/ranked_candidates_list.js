_.constructor("Views.RankedCandidatesList", View.Template, {
  content: function() { with(this.builder) {
    div(function() {
      div({'class': "candidatesListHeader"}, "Your Ranking");
      ol({id: "rankedCandidates", 'class': "candidates ranked"}, function() {

        li({id: "goodCandidatesExplanation"}, function() {
          span("Drag answers you like here, in order of preference.");
        }).ref('goodCandidatesExplanation');

        li({'class': "separator glossyBlack"}, function() {
          div({'class': "up"}, "good ideas");
          div({'class': "down"}, "bad ideas");
        }).ref('separator');

        li({id: "badCandidatesExplanation"}, function() {
          span("Drag answers you dislike here, in order of preference.");
        }).ref('badCandidatesExplanation');

      }).ref('rankedCandidatesList');
    });
  }},

  viewProperties: {
    initialize: function() {
      this.subscriptions = new Monarch.SubscriptionBundle();
      this.rankedCandidatesList.sortable({
        tolerance: "pointer",
        update: this.hitch('handleUpdate'),
        receive: this.hitch('handleReceive'),
        sort: this.hitch('handleSort')
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
          this.goodCandidatesExplanation.hide();
          this.separator.before(li);
        } else {
          this.badCandidatesExplanation.hide();
          this.rankedCandidatesList.append(li);
        }
      }, this);
      this.subscriptions.add(this.rankings.onRemoteRemove(function(ranking) {
        this.findLi(ranking.candidate()).remove();
        this.showOrHideDragTargetExplanations();
      }, this));
    },

    empty: function() {
      this.rankedCandidatesList.find("li.candidate").each(function() {
        $(this).view().remove();
      });
    },

    handleReceive: function(event, ui) {
      var candidate = Candidate.find(ui.item.attr('candidateId'));
      var rankedCandidateView = Views.RankedCandidateLi.toView({candidate: candidate});
      this.findPreviousLi(candidate).remove(); // may have already been ranked
      this.findLi(candidate).replaceWith(rankedCandidateView); // replace the clone of the draggable li with a real view
    },

    handleUpdate: function(event, ui) {
      this.showOrHideDragTargetExplanations();
      
      var candidate = Candidate.find(ui.item.attr('candidateId'));
      // received items are replaced with different object, so need to find from the list
      var rankedCandidateLi = this.findLi(candidate);
      rankedCandidateLi.view().startLoading();

      var belowSeparator = rankedCandidateLi.prevAll('.separator').length > 0;
      // the successor is higher in the list, the predecessor is lower.
      // we use prevAll/nextAll to skip the hidden explanation list elements if they are in the way
      var successorId = rankedCandidateLi.prevAll('.candidate:first, .separator').attr('candidateId');
      var predecessorId = rankedCandidateLi.nextAll('.candidate:first, .separator').attr('candidateId');
      var predecessor = predecessorId ? Candidate.find(predecessorId) : null;
      var successor = successorId ? Candidate.find(successorId) : null;

      Ranking.createOrUpdate(Application.currentUser(), this.election(), candidate, predecessor, successor, belowSeparator)
        .onSuccess(function(ranking) {
          if (!ranking) debugger;
          rankedCandidateLi.view().ranking = ranking;
          rankedCandidateLi.view().stopLoading();
        });
    },

    handleSort:  function(event, ui) {
      var placeholder = ui.placeholder;
      var beforeSeparator = placeholder.nextAll(".separator").length === 1;

      if (beforeSeparator && this.goodCandidatesExplanation.is(":visible")) {
        placeholder.hide();
      } else if (!beforeSeparator && this.badCandidatesExplanation.is(":visible")) {
        placeholder.hide();
      } else {
        placeholder.show();
      }
    },

    findPreviousLi: function(candidate) {
      return this.rankedCandidatesList.find("li.ranked.candidate[candidateId='" + candidate.id() + "']");
    },

    findLi: function(candidate) {
      var li = this.rankedCandidatesList.find("li[candidateId='" + candidate.id() + "']");
      return li.view() ? li.view() : li;
    },

    adjustHeight: function() {
      var height = $(window).height() - this.rankedCandidatesList.offset().top - 20
      this.rankedCandidatesList.height(height);
    },
    
    hasPositiveRankings: function() {
      return this.separator.prevAll('.candidate').length > 0;
    },

    hasNegativeRankings: function() {
      return this.separator.nextAll('.candidate').length > 0;
    },

    showOrHideDragTargetExplanations: function() {
      if (this.hasPositiveRankings()) {
        this.goodCandidatesExplanation.hide();
      } else {
        this.goodCandidatesExplanation.show();
      }

      if (this.hasNegativeRankings()) {
        this.badCandidatesExplanation.hide();
      } else {
        this.badCandidatesExplanation.show();
      }
    }
  }
});