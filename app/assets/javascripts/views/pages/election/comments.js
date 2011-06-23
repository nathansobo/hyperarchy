_.constructor('Views.Pages.Election.Comments', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({'class': "comments"}, function() {
      h2("Discussion");
      subview('list', Views.Components.SortedList, {
        buildElement: function(comment) {
          return Views.Pages.Election.CommentLi.toView({comment: comment});
        }
      });

      textarea().ref('textarea').bind('keydown', 'return', 'create');
      a({'class': "create button"}, "Add Comment").ref('createLink').click('create');
    });
  }},

  viewProperties: {
    comments: {
      change: function(comments) {
        this.list.relation(comments)
      }
    },

    create: function() {
      if (!$.trim(this.textarea.val())) return;
      
      this.comments().create({body: this.textarea.val()});
      this.textarea.val("");
    },

    attach: function() {
      this.textarea.elastic();
    }
  }
});
