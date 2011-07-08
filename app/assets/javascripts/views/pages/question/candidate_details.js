_.constructor('Views.Pages.Question.CandidateDetails', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "candidate-details"}, function() {
      a({'class': "close"}, "×")
        .ref('closeLink')
        .click(function() {
          History.pushState(null, null, this.parentView.question().url());
        });

      div(function() {
        div({'class': "body"}).ref("body");
        div({'class': "details"}).ref("details");
        a({'class': "edit button"}, "Edit").ref('editButton').click('edit');
        a({'class': "destroy button"}, "Delete").ref('destroyButton').click('destroy');
      }).ref('nonEditableContent');


      form(function() {
        textarea({name: "body", 'class': "body", tabindex: 101}).ref("editableBody");
        subview('charsRemaining', Views.Components.CharsRemaining, {limit: 140});
        label({'for': "details"}, "Further Details");
        textarea({name: 'details', 'class': "details", tabindex: 102}).ref("editableDetails");
      }).submit('update')
        .ref('form');
      a({'class': 'update button', tabindex: 103}, "Save").ref('updateButton').click('update');
      a({'class': 'cancel button', tabindex: 104}, "Cancel").ref('cancelEditButton').click('cancelEdit');
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
      }));
    },

    candidate: {
      change: function(candidate) {
        if (!candidate) return;
        this.body.bindText(candidate, 'body');
        this.details.bindText(candidate, 'details');
        this.avatar.user(candidate.creator());
        this.creatorName.bindText(candidate.creator(), 'fullName');
        this.createdAt.text(candidate.formattedCreatedAt());
        this.showOrHideMutateButtons();

        this.registerInterest(candidate, 'onDestroy', function() {
          History.pushState(null, null, candidate.question().url());
        });
        this.registerInterest(candidate, 'onUpdate', this.hitch('adjustCommentsHeight'));
        this.adjustCommentsHeight();
      },

      write: function(candidate) {
        this.cancelEdit();
      }
    },

    create: function() {
      if ($.trim(this.editableBody.val()) === '') return;

      if (Application.currentUser().guest()) {
        Application.promptSignup().success(this.hitch('create'));
        return false;
      }
      this.parentView.question().candidates().create(this.form.fieldValues());
      History.pushState(null, null, this.parentView.question().url());

      return false;
    },

    update: function(e) {
      e.preventDefault();
      if ($.trim(this.editableBody.val()) === '') return;
      if (this.editableBody.val().length > 140) return;
      this.candidate().update(this.form.fieldValues()).success(this.hitch('cancelEdit'));
    },

    destroy: function() {
      if (window.confirm("Are you sure you want to delete this answer?")) {
        this.candidate().destroy();
      }
    },

    edit: function() {
      this.nonEditableContent.hide();
      this.form.show();
      this.updateButton.show();
      this.cancelEditButton.show();
      if (this.candidate()) {
        this.editableBody.val(this.candidate().body()).keyup();
        this.editableDetails.val(this.candidate().details()).keyup();
      }

      this.editableBody.focus();
      this.adjustCommentsHeight();
    },

    showNewForm: function() {
      this.comments.hide();
      this.edit();
      this.editableBody.val('');
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
      if (this.candidate() && this.candidate().editableByCurrentUser()) {
        this.addClass('mutable');
      } else {
        this.removeClass('mutable');
      }
    },

    adjustCommentsHeight: function() {
      this.comments.fillVerticalSpace(this);
      this.comments.enableOrDisableFullHeight();
    },

    commentsTopPosition: function() {
      return this.creator.position().top + this.creator.height() + Application.lineHeight * 2;
    },

    loading: function(loading) {
      return this.comments.loading.apply(this.comments, arguments);
    }
  }
});
