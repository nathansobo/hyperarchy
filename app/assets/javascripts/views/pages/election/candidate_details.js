_.constructor('Views.Pages.Election.CandidateDetails', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "candidate-details"}, function() {
      a({'class': "close"}, "×")
        .ref('closeLink')
        .click(function() {
          History.pushState(null, null, this.parentView.election().url());
        });

      div(function() {
        div({'class': "body"}).ref("body");
        div({'class': "details"}).ref("details");
        a({'class': "edit button"}, "Edit").ref('editLink').click('edit');
        a({'class': "destroy button"}, "Delete").ref('destroyLink').click('destroy');
      }).ref('nonEditableContent');


      form(function() {
        textarea({name: "body", 'class': "body"}).ref("editableBody");
        label({'for': "body", 'class': "chars-remaining"}, "67 characters remaining");
        label({'for': "details"}, "Further Details");
        textarea({name: 'details', 'class': "details"}).ref("editableDetails");
      }).submit('update')
        .ref('form');
      a({'class': 'update button'}, "Save").ref('updateLink').click('update');
      a({'class': 'cancel button'}, "Cancel").ref('cancelEditLink').click('cancelEdit');
      a({'class': 'create button'}, "Add Answer").ref('createLink').click('create');

      div({'class': "creator"}, function() {
        subview('avatar', Views.Components.Avatar, {imageSize: 34});
        div({'class': "name"}).ref('creatorName');
        div({'class': "date"}).ref('createdAt');
      }).ref('creator');

      subview('comments', Views.Pages.Election.Comments);
    });
  }},

  viewProperties: {
    attach: function($super) {
      Application.signal('currentUser').change(this.hitch('showOrHideMutateLinks'));
      $super();
      $(window).resize(this.hitch('adjustCommentsTop'));
      this.editableBody.bind('elastic', this.hitch('adjustCommentsTop'));
      this.editableDetails.bind('elastic', this.hitch('adjustCommentsTop'));
    },

    candidate: {
      change: function(candidate) {
        if (!candidate) return;
        this.body.bindText(candidate, 'body');
        this.details.bindText(candidate, 'details');
        this.avatar.user(candidate.creator());
        this.creatorName.bindText(candidate.creator(), 'fullName');
        this.createdAt.text(candidate.formattedCreatedAt());
        this.showOrHideMutateLinks();

        this.registerInterest(candidate, 'onDestroy', function() {
          History.pushState(null, null, candidate.election().url());
        });
        this.registerInterest(candidate, 'onUpdate', this.hitch('adjustCommentsTop'));

        this.adjustCommentsTop();
      },

      write: function(candidate) {
        this.cancelEdit();
      }
    },

    create: function(e) {
      e.preventDefault();
      if ($.trim(this.editableBody.val()) === '') return;
      this.parentView.election().candidates().create(this.form.fieldValues());
      History.pushState(null, null, this.parentView.election().url());
    },

    update: function(e) {
      e.preventDefault();
      if ($.trim(this.editableBody.val()) === '') return;
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
      this.updateLink.show();
      this.cancelEditLink.show();
      if (this.candidate()) {
        this.editableBody.val(this.candidate().body()).elastic();
        this.editableDetails.val(this.candidate().details()).elastic();
      }

      this.editableBody.focus();
      this.adjustCommentsTop();
    },

    showNewForm: function() {
      this.comments.hide();
      this.edit();
      this.editableBody.val('');
      this.editableDetails.val('');
      this.cancelEditLink.hide();
      this.updateLink.hide();
      this.createLink.show();
      this.avatar.user(Application.currentUser());
      this.creatorName.text(Application.currentUser().fullName());
      return this.createdAt.text($.PHPDate("M j, Y @ g:ia", new Date()));
    },

    cancelEdit: function() {
      this.nonEditableContent.show();
      this.comments.show();
      this.form.hide();
      this.updateLink.hide();
      this.cancelEditLink.hide();
      this.createLink.hide();
      this.adjustCommentsTop();
    },

    showOrHideMutateLinks: function() {
      if (this.candidate() && this.candidate().editableByCurrentUser()) {
        this.editLink.show();
        this.destroyLink.show();
      } else {
        this.editLink.hide();
        this.destroyLink.hide();
      }
    },

    adjustCommentsTop: function() {
      this.comments.css('top', this.commentsTopPosition());
      this.comments.enableOrDisableFullHeight();
    },

    commentsTopPosition: function() {
      return this.creator.position().top + this.creator.height() + Application.lineHeight * 2;
    }
  }
});
