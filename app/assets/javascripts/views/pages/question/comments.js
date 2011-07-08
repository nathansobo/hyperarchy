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
        a({'class': "create button"}, "Add Comment").ref('createButton').click('create');
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
      if (Application.currentUser().guest()) {
        Application.promptSignup().success(this.hitch('create'));
        return false;
      }

      this.comments().create({body: this.textarea.val()});
      this.textarea.val("");
      this.textarea.keyup();
      return false;
    },

    attach: function() {
      this.list.onInsert = this.hitch('adjustHeightAndScroll');
      this.list.onRemove = this.hitch('enableOrDisableFullHeight');
      this.textarea.elastic();
      this.textarea.bind('elastic', this.hitch('adjustListBottom'));
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
      if (this.fullHeight()) this.list.scrollTop(this.list.attr('scrollHeight') - this.list.height());
    },

    adjustListBottom: function() {
      var bottomOfList = this.textareaAndButton.height();
      this.list.css('bottom', bottomOfList);
      this.scrollToBottom();
    },

    loading: {
      change: function(loading) {
        if (loading) {
          this.hide();
        } else {
          this.show();
        }
      }
    }
  }
});
