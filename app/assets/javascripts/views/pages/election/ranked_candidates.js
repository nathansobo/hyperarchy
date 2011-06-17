_.constructor('Views.Pages.Election.RankedCandidates', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "ranked-candidates"}, function() {
      h2("Your Ranking");
      ol(function() {
        li({id: "positive-drag-target"}, function() {
          span("Drag ideas you like here");
        }).ref('positiveDragTarget');
        li({id: 'separator'}, "Separator").ref('separator');
        li({id: "negative-drag-target"},function() {
          span("Drag ideas you dislike here");
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

      var list = this.list;
      var self = this;

      this.list.sortable({
        items: "li",

        update: function(event, ui) {
          if (ui.item.hasClass('ui-draggable')) return;
          ui.item.view().handleListDrop();
          self.showOrHideDragTargets();
        },

        receive: function(event, ui) {
          var candidate = ui.item.view().candidate;

          var existingRankingLi = self.lisByCandidateId[candidate.id()];
          if (existingRankingLi) existingRankingLi.remove();

          var rankingLi = Views.Pages.Election.RankingLi.toView({candidate: candidate});
          self.lisByCandidateId[candidate.id()] = rankingLi;

          var clonedLi = self.list.find('li.ui-draggable');
          clonedLi.replaceWith(rankingLi);
          rankingLi.handleListDrop();
          self.showOrHideDragTargets();
        },

        appendTo: "#election",
        helper: 'clone',
        sort: this.hitch('handleSort')
      });
    },

    handleSort:  function(event, ui) {
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

    rankings: {
      change: function(rankingsRelation) {
        this.lisByCandidateId = {};
        this.populateList();
        this.observeListUpdates();
      }
    },

    populateList: function() {
      this.separator.detach();
      this.positiveDragTarget.detach();
      this.negativeDragTarget.detach();

      this.list.find('li').remove();
      this.appendRankings(this.positiveRankings(), this.positiveDragTarget);
      this.list.append(this.separator);
      this.appendRankings(this.negativeRankings(), this.negativeDragTarget);
    },

    observeListUpdates: function() {
      this.rankingsSubscriptions.destroy();

      this.rankingsSubscriptions.add(this.positiveRankings().onInsert(this.hitch('insertAtIndex')));
      this.rankingsSubscriptions.add(this.positiveRankings().onUpdate(this.hitch('insertAtIndex')));
      this.rankingsSubscriptions.add(this.negativeRankings().onInsert(this.hitch('insertAtIndex')));
      this.rankingsSubscriptions.add(this.negativeRankings().onUpdate(this.hitch('insertAtIndex')));
      this.rankingsSubscriptions.add(this.rankings().onRemove(this.hitch('removeRanking')));
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
      this.lisByCandidateId[ranking.candidateId()].remove();
      delete this.lisByCandidateId[ranking.candidateId()];
      this.showOrHideDragTargets();
    },

    positiveRankings: function() {
      return this.rankings().where(Ranking.position.gt(0))
    },

    negativeRankings: function() {
      return this.rankings().where(Ranking.position.lt(0))
    },

    positiveLis: function() {
      return this.separator.prevAll('li.ranking').reverse();
    },

    negativeLis: function() {
      return this.separator.nextAll('li.ranking');
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
