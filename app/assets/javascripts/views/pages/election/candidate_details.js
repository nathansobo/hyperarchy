_.constructor('Views.Pages.Election.CandidateDetails', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "candidate-details"}, function() {
      div(function() {
        div({'class': "body"}).ref("body");
        div({'class': "details"}).ref("details");
        a({'class': "edit button"}, "Edit").ref('editLink').click('showForm');
      }).ref('nonEditableContent');


      form(function() {
        textarea({name: "body", 'class': "body"}).ref("formBody");
        label({'for': "body", 'class': "chars-remaining"}, "67 characters remaining");
        label({'for': "details"}, "Further Details");
        textarea({name: 'details', 'class': "details"}).ref("formDetails");


      }).submit('save')
        .ref('form');
      a({'class': 'save button'}, "Save").ref('saveLink').click('save');
      a({'class': 'cancel button'}, "Cancel").ref('cancelEditLink').click('hideForm');
      a({'class': 'create button'}, "Add Answer").ref('createLink').click('create');

      div({'class': "creator"}, function() {
        subview('avatar', Views.Components.Avatar, {imageSize: 34});
        div({'class': "name"}).ref('creatorName');
        div({'class': "date"}).ref('createdAt');
      }).ref('creator');

    });
  }},

  viewProperties: {
    attach: function() {
      Application.signal('currentUser').change(this.hitch('showOrHideEditLink'));
    },

    candidate: {
      change: function(candidate) {
        if (!candidate) return;
        this.body.bindText(candidate, 'body');
        this.details.bindText(candidate, 'details');
        this.avatar.user(candidate.creator());
        this.creatorName.bindText(candidate.creator(), 'fullName');
        this.createdAt.text(candidate.formattedCreatedAt());
        this.showOrHideEditLink();
      },

      write: function() {
        this.hideForm();
      }
    },

    save: function(e) {
      e.preventDefault();
      if ($.trim(this.formBody.val()) === '') return;
      this.candidate().update(this.form.fieldValues()).success(this.hitch('hideForm'));
    },

    create: function(e) {
      e.preventDefault();
      if ($.trim(this.formBody.val()) === '') return;
      this.parentView.election().candidates().create(this.form.fieldValues());
      History.pushState(null, null, this.parentView.election().url());
    },

    showForm: function() {
      this.nonEditableContent.hide();
      this.form.show();
      this.saveLink.show();
      this.cancelEditLink.show();
      if (this.candidate()) {
        this.formBody.val(this.candidate().body()).elastic();
        this.formDetails.val(this.candidate().details()).elastic();
      }

      this.formBody.focus();
    },

    showNewForm: function() {
      this.showForm();
      this.formBody.val('');
      this.formDetails.val('');
      this.cancelEditLink.hide();
      this.saveLink.hide();
      this.createLink.show();
      this.avatar.user(Application.currentUser());
      this.creatorName.text(Application.currentUser().fullName());
      return this.createdAt.text($.PHPDate("M j, Y @ g:ia", new Date()));
    },

    hideForm: function() {
      this.nonEditableContent.show();
      this.form.hide();
      this.saveLink.hide();
      this.cancelEditLink.hide();
      this.createLink.hide();
    },

    showOrHideEditLink: function() {
      if (this.candidate() && this.candidate().editableByCurrentUser()) {
        this.editLink.show();
      } else {
        this.editLink.hide();
      }
    }
  }
});
