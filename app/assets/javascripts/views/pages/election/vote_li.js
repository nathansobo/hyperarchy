_.constructor('Views.Pages.Election.VoteLi', Monarch.View.Template, {
  content: function(params) { with(this.builder) {
    li({'class': "vote"}, function() {
      subview('avatar', Views.Components.Avatar, {size: 33});
      div({'class': "name"}).ref('name');
      div({'class': "date"}).ref('date');
    });
  }},

  viewProperties: {
    initialize: function() {
      this.hide();
      User.findOrFetch(this.vote.userId()).success(function(user) {
        this.name.bindText(user, 'fullName');
        this.date.bindText(this.vote, 'formattedUpdatedAt');
        this.avatar.user(user);
        this.show();
      }, this);
    }
  }
});
