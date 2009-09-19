constructor("Views.Elections", View.Template, {
  content: function() { with(this.builder) {
    div({id: 'elections_view'}, function() {
      h2("elections");
      select().bind("organization_select");
    });
  }},

  view_properties: {
    initialize: function() {
      var self = this;
      Organization.fetch()
        .after_delta_events(function() {
          Organization.each(function(organization) {
            self.organization_select.append_view(function(b) {
              b.option(organization.name());
            });
          });
        });
    }
  }
});
