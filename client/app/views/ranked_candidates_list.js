_.constructor("Views.RankedCandidatesList", View.Template, {
  content: function() { with(this.builder) {
    div(function() {
      div({'class': "candidatesListHeader"}, "Your Ranking");
      ol({id: "rankedCandidates", 'class': "candidates ranked"}, function() {

        li({'class': "dragTargetExplanation"}, function() {
          span(function() {
            raw("Drag answers you <em>like</em> here, in order of preference.")
          });
        }).ref('goodCandidatesExplanation');

        li({'class': "separator glossyBlack"}, function() {
          div({'class': "up"}, "good ideas");
          div({'class': "down"}, "bad ideas");
        }).ref('separator');

        li({'class': "dragTargetExplanation"}, function() {
          span(function() {
            raw("Drag answers you <em>dislike</em> here, in order of preference.")
          });
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

      var returnFalse = function(e) { return false; };
      this.separator.mousedown(returnFalse);
      this.goodCandidatesExplanation.mousedown(returnFalse);
      this.badCandidatesExplanation.mousedown(returnFalse);

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
      this.find('.dragTargetExplanation').show();
      this.adjustDragTargetExplanationHeights();
    },

    handleReceive: function(event, ui) {
      var candidate = Candidate.find(ui.item.attr('candidateId'));
      var previouslyRankedLi = this.findPreviouslyRankedLi(candidate); // may have already been ranked before
      var rankedCandidateView = previouslyRankedLi ? previouslyRankedLi.detach() : Views.RankedCandidateLi.toView({candidate: candidate});
      this.findLi(candidate).replaceWith(rankedCandidateView); // replace the clone of the draggable li with a real view
    },

    handleUpdate: function(event, ui) {
      this.showOrHideDragTargetExplanations();
      var candidate = Candidate.find(ui.item.attr('candidateId'));
      var rankedCandidateLi = this.findLi(candidate);
      rankedCandidateLi.handleUpdate();
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

    findPreviouslyRankedLi: function(candidate) {
      var previouslyRankedLi = this.rankedCandidatesList.find("li.ranked.candidate[candidateId='" + candidate.id() + "']");
      return previouslyRankedLi.length > 0 ? previouslyRankedLi : null;
    },

    findLi: function(candidate) {
      var li = this.rankedCandidatesList.find("li[candidateId='" + candidate.id() + "']");
      return li.view() ? li.view() : li;
    },

    adjustHeight: function() {
      this.rankedCandidatesList.height($(window).height() - this.rankedCandidatesList.offset().top - 20);
      this.adjustDragTargetExplanationHeights();
    },

    fadeIn: function($super) {
      $super();
      this.adjustHeight();
    },

    afterShow: function() {
      this.adjustHeight();
    },

    adjustDragTargetExplanationHeights: function() {
      var explanationHeight = (this.rankedCandidatesList.height() - this.separator.outerHeight()) / 2;
      this.find('.dragTargetExplanation').each(function() {
        var elt = $(this);
        elt.height(explanationHeight);
        elt.find('span').position({
          my: 'center center',
          at: 'center center',
          of: elt
        });
      });
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

      this.adjustDragTargetExplanationHeights();
    }
  }
});