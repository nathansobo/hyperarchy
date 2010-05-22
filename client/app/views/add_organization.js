_.constructor("Views.AddOrganization", View.Template, {
    content: function() { with(this.builder) {
      div({'class': "addOrganization"}, function() {
        div({'class': "grid5 largeFont"}, function() {
          label({'for': "name"}, "Organization Name");
          input({name: "name", 'class': "text"});
          label({'for': "description"}, "Description (Optional)");
          textarea({name: "description", 'class': "text"});
          input({type: "submit", value: "Create and Invite Members"})
        });
        div({'class': "grid6 prefix1 largeFont"}, template.descriptionText());
      });
    }},

    descriptionText: function() {
      return "By adding your organization, you create a dedicated, private area where your members can raise questions, make suggestions, and vote on issues specific to them.";
    },

    viewProperties: {
      viewName: 'addOrganization'
    }
  });