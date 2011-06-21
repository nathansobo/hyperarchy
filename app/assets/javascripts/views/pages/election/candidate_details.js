_.constructor('Views.Pages.Election.CandidateDetails', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "candidate-details"}, function() {
      div({'class': "creator"}, function() {
        subview('avatar', Views.Components.Avatar, {imageSize: 34});
        div({'class': "name"}).ref('creatorName');
        div({'class': "date"}).ref('createdAt');
      }).ref('creator');
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

        a({'class': 'save button'}, "Save").ref('saveLink').click('save');
        a({'class': 'cancel button'}, "Cancel").ref('cancelEditLink').click('hideForm');
      }).submit('save')
        .ref('form');

    });
  }},

  viewProperties: {
    candidate: {
      change: function(candidate) {
        this.body.bindText(candidate, 'body');
        this.details.bindText(candidate, 'details');
        this.avatar.user(candidate.creator());
        this.creatorName.bindText(candidate.creator(), 'fullName');
        this.createdAt.text(candidate.formattedCreatedAt());
      },

      write: function() {
        this.hideForm();
      }
    },

    save: function(e) {
      e.preventDefault();
      this.candidate().update(this.form.fieldValues()).success(this.hitch('hideForm'));
    },

    showForm: function() {
      this.nonEditableContent.hide();
      this.form.show();
      this.formBody.val(this.candidate().body()).elastic();
      this.formDetails.val(this.candidate().details()).elastic();
    },

    hideForm: function() {
      this.nonEditableContent.show();
      this.form.hide();
    }
  }
});
