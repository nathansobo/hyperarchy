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
        this.defer(this.adjustHeightAndScroll);
      }
    },

    create: function() {
      if (!$.trim(this.textarea.val())) return false;

      
      this.comments().create({body: this.textarea.val()});
      this.textarea.val("");
      return false;
    },

    attach: function() {
      $(window).resize(this.hitch('adjustHeightAndScroll'));
      this.list.onInsert = this.hitch('adjustHeightAndScroll');
      this.list.onRemove = this.hitch('enableOrDisableFullHeight');
      this.textarea.elastic();
    },

    adjustHeightAndScroll: function() {
      this.enableOrDisableFullHeight();
      this.scrollToBottom();
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

    enableOrDisableFullHeight: function() {
      if (this.fullHeight()) {
        this.tryToDisableFullHeight();
      } else {
        this.tryToEnableFullHeight();
      }
    },

    tryToEnableFullHeight: function() {
      var contentHeight = this.textareaAndButton.position().top + this.textareaAndButton.height();
      var overflow = contentHeight - this.height();
      this.fullHeight(overflow >= 0);
    },
    
    tryToDisableFullHeight: function() {
      this.fullHeight(this.list.attr('scrollHeight') > this.list.height());
    },

    scrollToBottom: function(animate) {
      if (this.fullHeight()) this.list.attr('scrollTop', 99999999999999);
    }
  }
});
