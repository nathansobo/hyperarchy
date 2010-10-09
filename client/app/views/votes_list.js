_.constructor("Views.VotesList", View.Template, {
  content: function() { with(this.builder) {
    div({id: "votes"}, function() {
      div({id: "voteCount"}, function() {
        span("").ref('voteCount');
        span({'class': "instructions"}, "Click to view");
      });

      subview('votes', Views.SortedList, {
        buildLi: function(vote) {
          return Views.VoteLi.toView({vote: vote});
        },
        onRemoteInsert: function(vote, li) {
          li.effect('highlight');
        },
        onRemoteUpdate: function(vote, changes, li) {
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
        this.updateVoteCount();
        this.adjustHeight();
        this.subscriptions.destroy();
        this.subscriptions.add(election.votes().onRemoteInsert(this.hitch('updateVoteCount')));
        this.subscriptions.add(election.votes().onRemoteRemove(this.hitch('updateVoteCount')));
        this.votes.relation(election.votes());
      }
    },

    updateVoteCount: function() {
      var voteCount = this.election().votes().size();
      if (voteCount === 1) {
        this.voteCount.html("1 Vote");
      } else {
        this.voteCount.html(voteCount + " Votes");
      }
    },

    empty: function() {
      this.voteCount.empty();
      this.votes.empty();
    },

    startLoading: function() {
    },

    stopLoading: function() {
    },

    adjustHeight: function() {
      this.votes.fillVerticalSpace(20);
    }
  }
});