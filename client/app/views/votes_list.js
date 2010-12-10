_.constructor("Views.VotesList", View.Template, {
  content: function() { with(this.builder) {
    div({id: "votes", style: "display: none;"}, function() {
      div({id: "voteCount", 'class': "columnHeader"}, function() {
        span("").ref('voteCount');
      }).ref('headerArea');

      subview('votes', Views.SortedList, {
        buildElement: function(vote) {
          return Views.VoteLi.toView({vote: vote});
        },
        onRemoteInsert: function(vote, li) {
          li.effect('highlight');
        },
        onRemoteUpdate: function(li, vote, changes) {
          if (changes.updatedAt) {
            li.updateVotedAt();
            li.effect('highlight');
          }
        }
      });
    });
  }},

  viewProperties: {
    initialize: function() {
      this.subscriptions = new Monarch.SubscriptionBundle();
      var adjustHeight = this.hitch('adjustHeight');
      $(window).resize(adjustHeight);
    },

    election: {
      afterChange: function(election) {
        this.startLoading();
        election.fetchVotes()
          .onSuccess(function() {
            this.stopLoading();
            this.updateVoteCount();
            this.adjustHeight();
            this.subscriptions.destroy();
            this.subscriptions.add(election.votes().onRemoteInsert(this.hitch('updateVoteCount')));
            this.subscriptions.add(election.votes().onRemoteRemove(this.hitch('updateVoteCount')));
            this.votes.relation(election.votes());
          }, this);
      }
    },

    updateVoteCount: function() {
      var voteCount = this.election().votes().size();
      if (voteCount === 0) {
        this.hide();
      } else {
        this.show();
      }

      if (voteCount === 1) {
        this.voteCount.html("1 Vote");
      } else {
        this.voteCount.html(voteCount + " Votes");
      }

      if (voteCount === 0) {
        this.headerArea.addClass('noVotes')
      } else {
        this.headerArea.removeClass('noVotes')
      }
    },

    afterShow: function() {
      this.adjustHeight();
    },

    empty: function() {
      this.voteCount.empty();
      this.votes.empty();
    },

    startLoading: function() {
      this.empty();
    },

    stopLoading: function() {
    },

    adjustHeight: function() {
      this.votes.fillVerticalSpace(20);
    }
  }
});