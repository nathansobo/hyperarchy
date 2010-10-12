_.constructor("Views.VoteLi", View.Template, {
  content: function(attrs) { with(this.builder) {
    div({'class': "vote", 'style': "display: none;"}, function() {
      subview('avatar', Views.Avatar, { size: 40 });
      div({'class': "details"}, function() {
        div({'class': "name"}, "").ref('name');
        div({'class': "votedAt"}, "").ref('votedAt');
      });
      div({'class': "clear"});
    }).click('showRankings');
  }},
  
  viewProperties: {
    initialize: function() {
      var user = this.vote.user();
      if (!user) {
        User.fetch(this.vote.userId()).onSuccess(function() {
          this.initialize();
        }, this)
        return;
      }

      this.name.html(user.fullName());
      this.avatar.user(user);
      this.updateVotedAt();
      this.show();
    },

    updateVotedAt: function() {
      this.votedAt.html(this.vote.formattedUpdatedAt());
    },

    showRankings: function() {
      if (this.vote.user().isCurrent()) {
        $.bbq.removeState('rankingsUserId');
      } else {
        $.bbq.pushState({rankingsUserId: this.vote.userId()});
      }
    }
  }
});