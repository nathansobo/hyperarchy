_.constructor('Views.Pages.Election.CurrentConsensus', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "current-consensus"}, function() {
      subview('list', Views.Components.SortedList, {
        buildElement: function(candidate) {
          return Views.Pages.Election.CandidateLi.toView({candidate: candidate});
        },

        onUpdate: function(element, record) {
          element.position.text(record.position());
          element.body.text(record.body());
        }
      });
    })
  }},

  viewProperties: {

    attach: function($super) {
      $super();
      this.registerInterest(Application, 'onCurrentUserChange', this.hitch('handleCurrentUserChange'));
    },

    handleCurrentUserChange: function() {
      this.updateStatuses();
    },

    candidates: {
      change: function(candidates) {
        this.list.relation(candidates);
        this.updateStatuses();
        this.observeCurrentUserRankings();
      }
    },

    observeCurrentUserRankings: function() {
      var currentUserRankings = Application.currentUser().rankings();
      this.registerInterest(currentUserRankings, 'onUpdate', this.hitch('updateStatus'));
      this.registerInterest(currentUserRankings, 'onInsert', this.hitch('updateStatus'));
      this.registerInterest(currentUserRankings, 'onRemove', this.hitch('clearStatus'));
    },

    selectedCandidate: {
      change: function(selectedCandidate) {
        this.list.find('li').removeClass('selected');
        if (selectedCandidate) this.list.elementForRecord(selectedCandidate).addClass('selected');
      }
    },

    updateStatuses: function() {
      if (! this.candidates()) return;
      var currentUserRankings = Application.currentUser().rankings();
      this.candidates().each(function(candidate) {
        var ranking = currentUserRankings.find({candidateId: candidate.id()});
        this.list.elementForRecord(candidate).ranking(ranking);
      }, this);
    },

    updateStatus: function(ranking) {
      var candidate = ranking.candidate();
      this.list.elementForRecord(candidate).ranking(ranking);
    },

    clearStatus: function(ranking) {
      var candidate = ranking.candidate();
      this.list.elementForRecord(candidate).ranking(null);
    }
  }
});
