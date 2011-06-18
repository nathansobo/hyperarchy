_.constructor('Views.Pages.Election.RankedCandidates', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "ranked-candidates"}, function() {
      ol(function() {
        li({id: "positive-drag-target"}, function() {
          span("Drag ideas you like here").ref('positiveDragExplanation');
        }).ref('positiveDragTarget');
        li({id: 'separator'}, "Separator").ref('separator');
        li({id: "negative-drag-target"},function() {
          span("Drag ideas you dislike here").ref('negativeDragExplanation');
        }).ref('negativeDragTarget');
      }).ref('list')
    });
  }},

  viewProperties: {
    initialize: function() {
      this.separator.data('position', 0);
      this.rankingsSubscriptions = new Monarch.SubscriptionBundle();

      var returnFalse = function() { return false; }
      this.positiveDragTarget.mousedown(returnFalse);
      this.negativeDragTarget.mousedown(returnFalse);
      this.separator.mousedown(returnFalse);
    },

    attach: function($super) {
      $super();

      this.list.sortable({
        items: "li",

        tolerance: 'pointer',
        update: this.hitch('handleListUpdate'),
        receive: this.hitch('handleListReceive'),
        sort: this.hitch('handleListSort'),
        beforeStop: this.hitch('handleListBeforeStop'),

        appendTo: "#election",
        helper: 'clone'
      });
    },

    populateList: function() {
      this.separator.detach();
      this.detachDragTargets();

      this.list.find('li').remove();
      this.appendRankings(this.positiveRankings(), this.positiveDragTarget);
      this.list.append(this.separator);
      this.appendRankings(this.negativeRankings(), this.negativeDragTarget);
    },

    detachDragTargets: function() {
      this.positiveDragTarget.detach();
      this.negativeDragTarget.detach();
    },

    observeListUpdates: function() {
      this.rankingsSubscriptions.destroy();

      this.rankingsSubscriptions.add(this.positiveRankings().onInsert(this.hitch('insertAtIndex')));
      this.rankingsSubscriptions.add(this.positiveRankings().onUpdate(this.hitch('insertAtIndex')));
      this.rankingsSubscriptions.add(this.negativeRankings().onInsert(this.hitch('insertAtIndex')));
      this.rankingsSubscriptions.add(this.negativeRankings().onUpdate(this.hitch('insertAtIndex')));
      this.rankingsSubscriptions.add(this.rankings().onRemove(this.hitch('removeRanking')));
    },

    handleListUpdate: function(event, ui) {
      if (ui.item.hasClass('ui-draggable')) return; // received from other list, handle there
      if (!ui.item.view()) return;

      this.detachDragTargets();
      ui.item.view().handleListDrop();
      this.showOrHideDragTargets();
    },

    handleListBeforeStop: function(event, ui) {
      if (!ui.item.hasClass('ranking')) return;
      var helper = ui.helper, rankingLi = ui.item.view()

      if (!rankingLi.ranking) return;
      var ranking = rankingLi.ranking;

      if (Math.abs(ui.originalPosition.left - ui.position.left) < helper.width() * .33) return;

      var clone = helper.clone();
      helper.replaceWith(clone);
      clone
        .addClass('highlight')
        .hide('puff', function() {
          clone.remove();
        });

      this.removeRanking(ranking)
      ranking.destroy();
    },

    handleListSort:  function(event, ui) {
      var placeholder = ui.placeholder;
      var beforeSeparator = placeholder.nextAll("#separator").length === 1;

      if (beforeSeparator && this.positiveDragTarget.is(":visible")) {
        placeholder.hide();
      } else if (!beforeSeparator && this.negativeDragTarget.is(":visible")) {
        placeholder.hide();
      } else {
        placeholder.show();
      }
    },

    handleListReceive: function(event, ui) {
      var candidate = ui.item.view().candidate;

      var existingRankingLi = this.lisByCandidateId[candidate.id()];
      if (existingRankingLi) existingRankingLi.remove();

      var rankingLi = Views.Pages.Election.RankingLi.toView({candidate: candidate});
      this.lisByCandidateId[candidate.id()] = rankingLi;

      var clonedLi = this.list.find('li.ui-draggable');
      clonedLi.replaceWith(rankingLi);
      this.detachDragTargets();
      rankingLi.handleListDrop();
      this.showOrHideDragTargets();
    },

    rankings: {
      change: function(rankingsRelation) {
        this.lisByCandidateId = {};
        this.populateList();
        this.observeListUpdates();
      }
    },

    sortingEnabled: {
      change: function(enabled) {
        this.list.sortable(enabled ? 'enable' : 'disable');
        if (enabled) {
          this.positiveDragExplanation.css('visibility', 'visible');
          this.negativeDragExplanation.css('visibility', 'visible');
        } else {
          this.positiveDragExplanation.css('visibility', 'hidden');
          this.negativeDragExplanation.css('visibility', 'hidden');
        }
      }
    },

    insertAtIndex: function(ranking, changesetOrIndex, index) {
      if (_.isNumber(changesetOrIndex)) index = changesetOrIndex;

      var li = this.findOrCreateLi(ranking).detach();
      var lis = ranking.position() > 0 ? this.positiveLis() : this.negativeLis();
      var followingLi = lis.eq(index);

      if (followingLi.size() > 0) {
        li.insertBefore(followingLi);
      } else {
        if (ranking.position() > 0) {
          li.insertBefore(this.separator);
        } else {
          this.list.append(li);
        }
      }

      this.showOrHideDragTargets();
    },

    showOrHideDragTargets: function() {
      if (this.positiveLis().size() > 0) {
        this.positiveDragTarget.detach();
      } else {
        this.positiveDragTarget.detach().prependTo(this.list);
      }
      if (this.negativeLis().size() > 0) {
        this.negativeDragTarget.detach();
      } else {
        this.negativeDragTarget.detach().appendTo(this.list);
      }
    },

    removeRanking: function(ranking) {
      var candidateId = ranking.candidateId();
      var rankingLi = this.lisByCandidateId[candidateId];
      if (rankingLi) rankingLi.remove();
      delete this.lisByCandidateId[candidateId];
      this.showOrHideDragTargets();
    },

    positiveRankings: function() {
      return this.rankings().where(Ranking.position.gt(0))
    },

    negativeRankings: function() {
      return this.rankings().where(Ranking.position.lt(0))
    },

    positiveLis: function() {
      return this.separator.prevAll('li.ranking:not(.ui-sortable-placeholder)').reverse();
    },

    negativeLis: function() {
      return this.separator.nextAll('li.ranking:not(.ui-sortable-placeholder)');
    },

    findOrCreateLi: function(ranking) {
      var id = ranking.candidateId();
      if (!this.lisByCandidateId[id]) this.lisByCandidateId[id] = Views.Pages.Election.RankingLi.toView({ranking: ranking});
      return this.lisByCandidateId[id];
    },

    appendRankings: function(rankings, dragTargetIfEmpty) {
      if (rankings.empty()) this.list.append(dragTargetIfEmpty);

      rankings.each(function(ranking) {
        this.list.append(this.findOrCreateLi(ranking));
      }, this);
    }
  }
});
