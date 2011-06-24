_.constructor('Views.Pages.Election.Comments', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({'class': "comments"}, function() {
      h2("Discussion");
      subview('list', Views.Components.SortedList, {
        buildElement: function(comment) {
          return Views.Pages.Election.CommentLi.toView({comment: comment});
        }
      });

      div({'class': "textarea-and-button"}, function() {
        textarea().ref('textarea').bind('keydown', 'return', 'create');
        a({'class': "create button"}, "Add Comment").ref('createLink').click('create');
        div({'class': "clearfix"});
      }).ref('textareaAndButton');
    });
  }},

  viewProperties: {
    comments: {
      change: function(comments) {
        this.list.relation(comments);
        this.defer(this.scrollToBottom);
      }
    },

    create: function() {
      if (!$.trim(this.textarea.val())) return false;

      
      this.comments().create({body: this.textarea.val()});
      this.textarea.val("");
      return false;
    },

    attach: function() {
      $(window).resize(this.hitch('scrollToBottom'));
      this.list.onInsert = this.hitch('scrollToBottom');
      this.textarea.elastic();
    },

    fullHeight: {
      change: function(fullHeight) {
        if (fullHeight) {
          this.addClass('full-height');
        } else {
          this.removeClass('full-height');
        }
      }
    },

    scrollToBottom: function(animate) {
      var contentHeight = this.textareaAndButton.position().top + this.textareaAndButton.height();
      var overflow = contentHeight - this.height();

      console.debug(overflow >= 0);

      this.fullHeight(overflow >= 0);
      if (this.fullHeight()) this.list.attr('scrollTop', 99999999999999);
    }
  }
});
