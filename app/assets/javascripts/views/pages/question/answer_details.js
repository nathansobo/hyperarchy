_.constructor('Views.Pages.Question.AnswerDetails', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "answer-details"}, function() {
      div({'class': "non-editable"}, function() {
        div({'class': "body"}).ref("body");
        span({'class': "details"}).ref("details");
        span({'class': "details"}).ref("expandedDetails");
        a({'class': "more link"}, "more ↓").
          ref("expandButton").
          click(function() {
            this.expanded(true);
          });
        a({'class': "less link"}, "less ↑ ").
          ref("contractButton").
          click(function() {
            this.expanded(false);
          });
        div({'class': "clear"});
        a({'class': "edit"}, "✎ edit").ref('editButton').click('edit');
        a({'class': "destroy"}, "✕ delete").ref('destroyButton').click('destroy');
      }).ref('nonEditableContent');

      form(function() {
        textarea({name: "body", 'class': "body", tabindex: 201}).ref("editableBody");
        subview('charsRemaining', Views.Components.CharsRemaining, {limit: 140});
        label({'for': "details"}, "Further Details");
        textarea({name: 'details', 'class': "details", tabindex: 202}).ref("editableDetails");
      }).submit('update')
        .ref('form');
      a({'class': 'update button', tabindex: 203}, "Save").ref('updateButton').click('update');
      a({'class': 'cancel button', tabindex: 204}, "Cancel").ref('cancelEditButton').click('cancelEdit');
      a({'class': 'create button'}, "Add Answer").ref('createButton').click('create');

      div({'class': "creator"}, function() {
        subview('avatar', Views.Components.Avatar, {imageSize: 34});
        div({'class': "name"}).ref('creatorName');
        div({'class': "date"}).ref('createdAt');
      }).ref('creator');

      subview('comments', Views.Pages.Question.Comments);
    });
  }},

  viewProperties: {
    attach: function($super) {
      Application.onCurrentUserChange(this.hitch('showOrHideMutateButtons'));
      $super();
      $(window).resize(this.hitch('adjustCommentsHeight'));
      this.editableBody.elastic();
      this.editableDetails.elastic();
      this.editableBody.bind('elastic', this.hitch('adjustCommentsHeight'));
      this.charsRemaining.field(this.editableBody);
      this.editableDetails.bind('elastic', this.hitch('adjustCommentsHeight'));
      this.editableBody.bind('keydown', 'return', this.bind(function() {
        this.find(".create:visible, .update:visible").click();
        return false;
      }));
    },

    answer: {
      change: function(answer) {
        if (!answer) return;
        this.body.bindMarkdown(answer, 'body');
        this.avatar.user(answer.creator());
        this.creatorName.bindText(answer.creator(), 'fullName');
        this.createdAt.text(answer.formattedCreatedAt());
        this.showOrHideMutateButtons();

        answer.trackView();

        this.registerInterest(answer, 'onDestroy', function() {
          History.pushState(null, null, answer.question().url());
        });
        this.registerInterest(answer, 'onUpdate', this.hitch('handleAnswerUpdate'));
        this.handleAnswerUpdate();
        this.expanded(false);
      },

      write: function(answer) {
        this.cancelEdit();
      }
    },

    create: function() {
      if ($.trim(this.editableBody.val()) === '') return;

      var fieldValues = this.form.fieldValues();
      Application.promptSignup().success(function() {
        this.parentView.question().answers().create(fieldValues).success(function(answer) {
          answer.trackCreate();
        });
        History.pushState(null, null, this.parentView.question().url());
      }, this);
      return false;
    },

    update: function(e) {
      e.preventDefault();
      if ($.trim(this.editableBody.val()) === '') return;
      if (this.editableBody.val().length > 140) return;
      this.answer().update(this.form.fieldValues()).success(this.bind(function(answer) {
        answer.trackUpdate();
        this.cancelEdit();
      }));
    },

    destroy: function() {
      if (window.confirm("Are you sure you want to delete this answer?")) {
        this.answer().destroy();
      }
    },

    edit: function() {
      this.nonEditableContent.hide();
      this.form.show();
      this.updateButton.show();
      this.cancelEditButton.show();
      if (this.answer()) {
        this.editableBody.val(this.answer().body()).keyup();
        this.editableDetails.val(this.answer().details()).keyup();
      }

      this.editableBody.focus();
      this.adjustCommentsHeight();
    },

    showNewForm: function() {
      this.comments.hide();
      this.edit();
      this.editableBody.val('');
      this.editableBody.keyup();
      this.editableDetails.val('');
      this.cancelEditButton.hide();
      this.updateButton.hide();
      this.createButton.show();
      this.avatar.user(Application.currentUser());
      this.creatorName.text(Application.currentUser().fullName());
      return this.createdAt.text($.PHPDate("M j, Y @ g:ia", new Date()));
    },

    cancelEdit: function() {
      this.nonEditableContent.show();
      if (!this.comments.loading()) this.comments.show();
      this.form.hide();
      this.updateButton.hide();
      this.cancelEditButton.hide();
      this.createButton.hide();
      this.adjustCommentsHeight();
    },

    showOrHideMutateButtons: function() {
      if (this.answer() && this.answer().editableByCurrentUser()) {
        this.addClass('mutable');
      } else {
        this.removeClass('mutable');
      }
    },

    expanded: {
      change: function(isExpanded) {
        this.comments.expanded(isExpanded);
        if (isExpanded) {
          this.addClass('expanded');
          this.details.hide();
          this.expandedDetails.show();
          this.contractButton.show();
          this.expandButton.hide();
        } else {
          this.removeClass('expanded');
          this.expandedDetails.hide();
          this.details.show();
          this.contractButton.hide();
          this.scrollTop(0);
          this.showOrHideMoreButton();
          this.adjustCommentsHeight();
        }
      }
    },

    showOrHideMoreButton: function() {
      if (!this.answer()) debugger;
      var details = this.answer().details();
      if (!this.expanded() && details && details.length > this.maxDetailsLength) {
        this.expandButton.show();
      } else {
        this.expandButton.hide();
      }
    },

    truncate: function(string, maxChars) {
      if (string.length < maxChars) {
        return string
      } else {
        var lastSpacePosition = string.lastIndexOf(" ", maxChars);
        return string.substring(0, lastSpacePosition) + "…";
      }
    },

    maxDetailsLength: 200,

    handleAnswerUpdate: function() {
      var answer = this.answer();
      this.details.markdown(this.truncate(answer.details() || "", this.maxDetailsLength));
      this.expandedDetails.markdown(answer.details());
      this.adjustCommentsHeight();
      this.showOrHideMoreButton();
    },

    adjustCommentsHeight: function() {
      if (this.expanded()) return;
      this.comments.fillVerticalSpace(this);
      this.comments.adjustHeightAndScroll();
    },

    loading: function(loading) {
      return this.comments.loading.apply(this.comments, arguments);
    },

    scrollToBottom: function() {
      console.log(this.height(), this.attr('scrollHeight'));
      this.scrollTop(this.attr('scrollHeight') - this.height());
    }
  }
});
