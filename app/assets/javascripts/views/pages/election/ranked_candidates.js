_.constructor('Views.Pages.Election.RankedCandidates', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "ranked-candidates"}, function() {
      ol(function() {
        li({id: 'separator'}, "Separator").ref('separator');
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
        update: function(event, ui) {
          if (ui.item.hasClass('ui-draggable')) return;
          self.handleItemDrop(ui.item);
        },

        receive: function(event, ui) {
          var candidate = ui.item.view().candidate;
          var clonedLi = self.list.find('li.ui-draggable');

          var existingRankingLi = self.lisByCandidateId[candidate.id()];
          if (existingRankingLi) {
            existingRankingLi.remove();
            delete self.lisByCandidateId[candidate.id()];
          }

          var rankingLi = Views.Pages.Election.RankingLi.toView({candidate: candidate});

          self.lisByCandidateId[candidate.id()] = rankingLi;

          clonedLi.replaceWith(rankingLi);
          self.handleItemDrop(rankingLi);
        }
      });
    },

    handleItemDrop: function(item) {
      var candidate = item.view().candidate;

      var nextLi = item.next('li');
      var nextPosition = nextLi.data('position');

      var prevLi = item.prev('li');
      var prevPosition = prevLi.data('position');

      if (prevPosition === undefined) prevPosition = nextPosition + 128;
      if (nextPosition === undefined) nextPosition = prevPosition - 128;

      var position = (nextPosition + prevPosition) / 2;
      item.data('position', position);
      Ranking.createOrUpdate(Application.currentUser(), candidate, position);
    },

    rankings: {
      change: function(rankingsRelation) {
        this.lisByCandidateId = {};
        this.populateList();
        this.monitorListUpdates();
      }
    },

    populateList: function() {
      this.separator.detach();
      this.list.empty();
      this.appendRankings(this.positiveRankings());
      this.list.append(this.separator);
      this.appendRankings(this.negativeRankings());
    },

    monitorListUpdates: function() {
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
    },

    removeRanking: function(ranking) {
      this.lisByCandidateId[ranking.candidateId()].remove();
      delete this.lisByCandidateId[ranking.candidateId()];
    },

    positiveRankings: function() {
      return this.rankings().where(Ranking.position.gt(0))
    },

    negativeRankings: function() {
      return this.rankings().where(Ranking.position.lt(0))
    },

    positiveLis: function() {
      return this.separator.prevAll().reverse();
    },

    negativeLis: function() {
      return this.separator.nextAll();
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
