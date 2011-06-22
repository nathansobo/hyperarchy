_.constructor('Views.Pages.Election.ElectionCommentLi', Monarch.View.Template, {
  content: function() { with(this.builder) {
    li({'class': "comment"}, function() {
      subview('avatar', Views.Components.Avatar, {imageSize: 34});
      div({'class': "destroy icon"});
      div({'class': "date"}).ref('createdAt');
      div({'class': "text"}, function() {
        div({'class': "name"}).ref('creatorName');
        span({'class': "body"}).ref('body');
      });
    })
  }},

  viewProperties: {
    initialize: function() {
      this.avatar.user(this.comment.creator());
      this.creatorName.bindText(this.comment.creator(), 'fullName');
      this.body.text(this.comment.body());
      this.createdAt.text(this.comment.formattedCreatedAt());
    }
  }
});
