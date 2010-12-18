_.constructor("Views.EmailPreferences", View.Template, {
  content: function(params) { with(this.builder) {
    var organization = params.membership.organization();
    div({'class': "emailPreferences dropShadow"}, function() {
      div({'class': "loading", style: "display: none;"}).ref('saving');
      div({'class': "organizationName"}, organization.name() + " Email Preferences");
      div({'class': "emailPreference"}, function() {
        input({type: "checkbox", name: "notifyOfNewElections"});
        label("Send me emails when new questions are added.");
      });
      div({'class': "emailPreference"}, function() {
        input({type: "checkbox", name: "notifyOfNewCandidates"});
        label("Send me emails when new answers are added to questions on which I have voted.");
      });
    });
  }},

  viewProperties: {
    initialize: function() {
      this.model(this.membership);
      this.observeFormFields();

      this.membership.onDirty(function() {
        this.saving.show();
        this.membership.save().onSuccess(function() {
          this.saving.hide();
        }, this);
      }, this);
    }
  }
});