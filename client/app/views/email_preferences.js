_.constructor("Views.EmailPreferences", View.Template, {
  content: function(params) { with(this.builder) {
    var organization = params.membership.organization();
    div({'class': "emailPreferences"}, function() {
      div({'class': "loading", style: "display: none;"}).ref('saving');
      h2(organization.name() + " Email Preferences");
      div({'class': "emailPreference"}, function() {
        label("Email me about new questions: ");
        select({name: "electionAlerts"}, function() {
          option({value: "immediately"}, "Immediately");
          option({value: "hourly"}, "Hourly");
          option({value: "daily"}, "Daily");
          option({value: "weekly"}, "Weekly");
          option({value: "never"}, "Never");
        });
      });
      div({'class': "emailPreference"}, function() {
        label("Email me about new answers to questions on which I voted: ");
        select({name: "candidateAlerts"}, function() {
          option({value: "immediately"}, "Immediately");
          option({value: "hourly"}, "Hourly");
          option({value: "daily"}, "Daily");
          option({value: "weekly"}, "Weekly");
          option({value: "never"}, "Never");
        });
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