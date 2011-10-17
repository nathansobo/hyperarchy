//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

_.constructor('Views.Pages.Question.CommentLi', Monarch.View.Template, {
  content: function(params) { with(this.builder) {
    li({'class': "comment"}, function() {
      subview('avatar', Views.Components.Avatar, {imageSize: params.fullScreen ? 46 : 34});
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
      this.body.markdown(this.comment.body());
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
