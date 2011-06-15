_.constructor('Views.Pages.Election.RankedCandidates', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div(function() {
      ol(function() {
        li({id: 'separator'}, "Separator").ref('separator');
      }).ref('list')
    });
  }},

  viewProperties: {

    initialize: function() {
      this.separator.data('position', 0);
    },

    attach: function($super) {
      $super();

      var list = this.list;

      this.list.sortable({
        update: function(event, ui) {
          var ranking = ui.item.view().ranking;
          var nextPosition, prevPosition;

          var nextLi = ui.item.next('li');
          nextPosition = nextLi.data('position');

          var prevLi = ui.item.prev('li');
          prevPosition = prevLi.data('position');

          if (prevPosition === undefined) prevPosition = nextPosition + 128;
          if (nextPosition === undefined) nextPosition = prevPosition - 128;

          Ranking.createOrUpdate(Application.currentUser(), ranking.candidate(), (nextPosition + prevPosition) / 2);
        },
      });
    },

    rankings: {
      change: function(rankingsRelation) {
        this.lisByRankingId = {};
        this.populateList();
        this.monitorListUpdates();
      }
    },

    populateList: function() {
      this.separator.detach();
      this.appendRankings(this.positiveRankings());
      this.list.append(this.separator);
      this.appendRankings(this.negativeRankings());
    },

    monitorListUpdates: function() {
      this.positiveRankings().onInsert(this.hitch('insertAtIndex'));
      this.positiveRankings().onUpdate(this.hitch('insertAtIndex'));
      this.negativeRankings().onInsert(this.hitch('insertAtIndex'));
      this.negativeRankings().onUpdate(this.hitch('insertAtIndex'));
      this.rankings().onRemove(this.hitch('removeRanking'));
    },

    insertAtIndex: function(ranking, changesetOrIndex, index) {
      if (_.isNumber(changesetOrIndex)) index = changesetOrIndex;

      var li = this.findOrCreateLi(ranking).detach();
      var lis = ranking.position() > 0 ? this.positiveLis() : this.negativeLis();
      var followingLi = lis.eq(index);
      if (followingLi.size() > 0) {
        li.insertBefore(followingLi);
      } else {
        lis.append(li);
      }
    },

    removeRanking: function(ranking) {
      this.lisByRankingId[ranking.id()].remove();
      delete this.lisByRankingId[ranking.id()];
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
      var id = ranking.id();
      if (!this.lisByRankingId[id]) this.lisByRankingId[id] = Views.Pages.Election.RankingLi.toView({ranking: ranking});
      return this.lisByRankingId[id];
    },

    appendRankings: function(rankings) {
      rankings.each(function(ranking) {
        this.list.append(this.findOrCreateLi(ranking));
      }, this);
    }
  }
});
