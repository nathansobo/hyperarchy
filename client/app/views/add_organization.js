_.constructor("Views.AddOrganization", View.Template, {
  content: function() { with(this.builder) {
    div({id: "addOrganization"}, function() {
      div({'class': "grid5 largeFont"}, function() {
        label({'for': "name"}, "Organization Name");
        input({name: "name", 'class': "text"});
        label({'for': "description"}, "Description (Optional)");
        textarea({name: "description", 'class': "text"});
        button("Create and Invite Members")
          .ref('createOrganizationButton')
          .click('createOrganization');
      })
      div({'class': "grid6 prefix1 largeFont"}, template.descriptionText());
      div({'class': "clear"});
    });
  }},

  descriptionText: function() {
    return "By adding your organization, you create a dedicated, private area where your members can raise questions, make suggestions, and vote on issues specific to them.";
  },

  viewProperties: {
    viewName: 'addOrganization',

    createOrganization: function() {
      Organization.create(this.fieldValues())
        .onSuccess(function(organization) {
          Application.currentUser().memberships().where({organizationId: organization.id()}).fetch()
            .onSuccess(function() {
              $.bbq.pushState({view: 'editOrganization', organizationId: organization.id()});
            });
        });
    }
  }
});