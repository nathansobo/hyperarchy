_.constructor('Views.Pages.Election.RankedCandidates', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "ranked-candidates"}, function() {
      ol(function() {
        div().ref('positiveDragTarget');
        li({id: 'separator'}, "Separator").ref('separator');
        div().ref('negativeDragTarget');
      }).ref('list')
    });
  }},

  viewProperties: {

    initialize: function() {
      this.separator.data('position', 0);
      this.rankingsSubscriptions = new Monarch.SubscriptionBundle();
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
        }
      });
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
      this.list.find('li').remove();
      this.appendRankings(this.positiveRankings());
      this.list.append(this.separator);
      this.appendRankings(this.negativeRankings());
      this.showOrHideDragTargets();
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
        this.positiveDragTarget.hide();
      } else {
        this.positiveDragTarget.show();
      }
      if (this.negativeLis().size() > 0) {
        this.negativeDragTarget.hide();
      } else {
        this.negativeDragTarget.show();
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
      return this.separator.prevAll('li').reverse();
    },

    negativeLis: function() {
      return this.separator.nextAll('li');
    },

    findOrCreateLi: function(ranking) {
      var id = ranking.candidateId();
      if (!this.lisByCandidateId[id]) this.lisByCandidateId[id] = Views.Pages.Election.RankingLi.toView({ranking: ranking});
      return this.lisByCandidateId[id];
    },

    appendRankings: function(rankings) {
      rankings.each(function(ranking) {
        this.list.append(this.findOrCreateLi(ranking));
      }, this);
    }
  }
});
