_.constructor("Views.VoteLi", View.Template, {
  content: function(attrs) { with(this.builder) {
    div({'class': "vote", 'style': "display: none;"}, function() {
      img({'class': "avatar", src: ""}).ref('avatar');
      div({'class': "name"}, "").ref('name');
      div({'class': "votedAt"}, "").ref('votedAt');
      div({'class': "clear"});
    });
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
      this.avatar.attr('src', user.gravatarUrl());
      this.updateVotedAt();
      this.show();
    },

    updateVotedAt: function() {
      this.votedAt.html(this.vote.formattedUpdatedAt());
    }
  }
});