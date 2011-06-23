_.constructor('Views.Pages.Election.ElectionDetails', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "election-details"}, function() {
      div({'class': "main"}, function() {
        h2({'class': 'body'}).ref('body');
        div({'class': 'details'}).ref('details');
      }).ref('nonEditableContent');

      form({'class': "main"}, function() {
        textarea({name: "body", 'class': "body"}).ref("formBody");
        label({'for': "body", 'class': "chars-remaining"}, "67 characters remaining");
        label({'for': "details"}, "Further Details");
        textarea({name: 'details', 'class': "details"}).ref("formDetails");
      }).submit('save')
        .ref('form');

      a({'class': 'update button'}, "Save").ref('updateLink').click('save');
      a({'class': 'cancel button'}, "Cancel").ref('cancelEditLink').click('hideForm');
      a({'class': "edit button"}, "Edit").ref('editLink').click('showForm');

      div({'class': 'creator'}, function() {
        subview('avatar', Views.Components.Avatar, {imageSize: 34});
        div({'class': 'name'}).ref('creatorName');
        div({'class': 'date'}).ref('createdAt');
      });

      subview('comments', Views.Pages.Election.ElectionComments);
    });
  }},

  viewProperties: {
    election: {
      change: function(election) {
        this.body.bindText(election, 'body');
        this.details.bindText(election, 'details');
        this.comments.comments(election.comments());

        if (this.electionUpdateSubscription) this.electionUpdateSubscription.destroy();
        this.electionUpdateSubscription = election.onUpdate(this.hitch('showOrHideDetails'));

        this.showOrHideDetails();
        this.avatar.user(election.creator());
        this.creatorName.bindText(election.creator(), 'fullName');
        this.createdAt.text(election.formattedCreatedAt());
        this.hideForm();
      }
    },

    save: function(e) {
      e.preventDefault();
      this.election().update(this.form.fieldValues()).success(this.hitch('hideForm'));
    },

    showForm: function() {
      this.nonEditableContent.hide();
      this.editLink.hide();
      this.form.show();
      this.formBody.val(this.election().body()).elastic();
      this.formDetails.val(this.election().details()).elastic();
      this.updateLink.show();
      this.cancelEditLink.show();
    },

    hideForm: function() {
      this.nonEditableContent.show();
      this.editLink.show();
      this.form.hide();
      this.updateLink.hide();
      this.cancelEditLink.hide();
    },

    showOrHideDetails: function() {
      if (this.election().details()) {
        this.details.show()
      } else {
        this.details.hide()
      }
    }
  }
});
