_.constructor('Views.Pages.Election.CandidateDetails', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "candidate-details"}, function() {
      div(function() {
        div({'class': "body"}).ref("body");
        div({'class': "details"}).ref("details");
        a("Edit").ref('editLink').click('edit');
      }).ref('nonEditableContent');

      form(function() {
        textarea({name: "body", 'class': "body"}).ref("formBody");
        label({'for': "details"}, "Further Details");
        textarea({name: 'details', 'class': "details"}).ref("formDetails");

        a("Cancel").ref('cancelEditLink').click('hideForm');
        a("Save").ref('saveLink').click('save');
      }).submit('save')
        .ref('form');
    });
  }},

  viewProperties: {
    candidate: {
      change: function(candidate) {
        this.body.bindText(candidate, 'body');
        this.details.bindText(candidate, 'details');
      }
    },

    edit: function() {
      this.nonEditableContent.hide();
      this.form.show();
      this.formBody.val(this.candidate().body());
      this.formDetails.val(this.candidate().details());
    },

    save: function(e) {
      e.preventDefault();
      this.candidate().update(this.form.fieldValues()).success(this.hitch('hideForm'));
    },

    hideForm: function() {
      this.nonEditableContent.show();
      this.form.hide();
    }
  }
});
