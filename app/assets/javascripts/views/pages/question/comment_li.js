_.constructor('Views.Pages.Question.CommentLi', Monarch.View.Template, {
  content: function() { with(this.builder) {
    li({'class': "comment"}, function() {
      subview('avatar', Views.Components.Avatar, {imageSize: 34});
      a({'class': "destroy"}, "×").ref('destroyButton').click('destroy');
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
      this.registerInterest(Application.signal('currentUser'), 'change', this.hitch('enableOrDisableDestruction'));
      this.enableOrDisableDestruction();
    },

    enableOrDisableDestruction: function() {
      if (this.comment.editableByCurrentUser()) {
        this.addClass('destroyable');
      } else {
        this.removeClass('destroyable');
      }
    },

    destroy: function() {
      this.comment.destroy();
    }
  }
});
