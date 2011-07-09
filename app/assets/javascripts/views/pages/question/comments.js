_.constructor('Views.Pages.Question.Comments', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({'class': "comments"}, function() {
      h2("Discussion").ref('header');
      subview('list', Views.Components.SortedList, {
        buildElement: function(comment) {
          return Views.Pages.Question.CommentLi.toView({comment: comment});
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
        this.delay(this.adjustHeightAndScroll, 200);
      }
    },

    afterShow: function() {
      this.adjustHeightAndScroll();
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
      this.textarea.elastic();
      this.list.onInsert = this.hitch('adjustHeightAndScroll');
      this.list.onRemove = this.hitch('adjustHeightAndScroll');
      this.textarea.bind('elastic', this.hitch('adjustHeightAndScroll'));
    },

    adjustHeightAndScroll: function() {
      this.list.css('max-height', this.height() - this.headerHeight() - this.textareaAndButtonHeight() - 2);
      this.scrollToBottom();
    },

    headerHeight: function() {
      return this.header.height() + parseInt(this.header.css('margin-bottom'));
    },

    textareaAndButtonHeight: function() {
      return this.textareaAndButton.height() + parseInt(this.list.css('margin-bottom'));
    },

    scrollToBottom: function(animate) {
      this.list.scrollTop(this.list.attr('scrollHeight') - this.list.height());
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
