//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

_.constructor('Views.Pages.Question.Comments', Monarch.View.Template, {
  content: function(params) { with(this.builder) {
    div({'class': "comments"}, function() {
      h2("Discussion").ref('header');
      subview('list', Views.Components.SortedList, {
        buildElement: function(comment) {
          return Views.Pages.Question.CommentLi.toView({comment: comment, fullScreen: (params && params.fullScreen)});
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
    initialize: function() {
      this.list.scroll(this.hitch('enableOrDisableAutoScroll'));
      this.autoScroll = true;
    },

    comments: {
      change: function(comments) {
        this.list.relation(comments);
        this.defer(this.adjustListHeight);
      }
    },

    afterShow: function() {
      this.adjustListHeight();
    },

    create: function() {
      if (!$.trim(this.textarea.val())) return false;
      if (Application.currentUser().guest()) {
        Application.promptSignup().success(this.hitch('create'));
        return false;
      }

      this.scrollToBottom();
      this.autoScroll = true;
      this.comments().create({body: this.textarea.val()}).success(function(comment) {
        comment.trackCreate();
      });

      this.textarea.val("");
      this.textarea.keyup();
      return false;
    },

    attach: function() {
      this.textarea.elastic();
      this.list.onInsert = this.hitch('scrollToBottomIfEnabled');
      this.list.onRemove = this.hitch('scrollToBottomIfEnabled');
      this.textarea.bind('elastic', this.hitch('adjustListHeight'));
    },

    height: function($super, height) {
      if (height) {
        if (this.expanded()) {
          console.log("Ignoring height in expanded mode");
          return $super();
        }

        var val = $super(height);
        this.adjustListHeight();
        return val;
      } else {
        return $super();
      }
    },

    enableOrDisableAutoScroll: function() {
      this.autoScroll = (this.list.scrollTop() === this.list.attr('scrollHeight') - this.list.height());
    },

    adjustListHeight: function() {
      this.list.css('max-height', this.height() - this.headerHeight() - this.textareaAndButtonHeight() - 2);
      this.scrollToBottomIfEnabled();
    },

    headerHeight: function() {
      return this.header.height() + parseInt(this.header.css('margin-bottom'));
    },

    textareaAndButtonHeight: function() {
      return this.textareaAndButton.outerHeight() + parseInt(this.list.css('margin-bottom'));
    },

    scrollToBottomIfEnabled: function() {
      if (this.autoScroll) this.scrollToBottom();
    },

    scrollToBottom: function(force) {
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
    },

    expanded: {
      change: function(isExpanded) {
        if (isExpanded) {
          this.css('height', 'auto');
          this.list.css('max-height', 'none');
        } else {
          this.adjustListHeight();
        }
      }
    }
  }
});
