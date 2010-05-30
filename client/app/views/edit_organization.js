_.constructor("Views.EditOrganization", View.Template, {
  content: function() { with(this.builder) {
    div({'class': "editOrganization"}, function() {
      div({'class': "grid5 largeFont"}, function() {
        label({'for': "name"}, "Organization Name");
        input({name: "name", 'class': "text"});
        label({'for': "description"}, "Description (Optional)");
        textarea({name: "description", 'class': "text"});
        input({type: "submit", value: "Create and Invite Members"})
          .ref('createOrganizationButton')
          .click('createOrganization');
      })

      div({'class': "grid6 prefix1 largeFont"}, function() {
        h1("Members");
      });
    });
  }},

  viewProperties: {
    viewName: 'editOrganization',

    navigate: function(state) {
      this.organization = Organization.find(state.organizationId);

      if (!this.organization) {
        Organization.fetch(state.organizationId);
      }

      this.model(organization);
    },

    createOrganization: function() {
      Organization.create(this.fieldValues())
        .onSuccess(function(organization) {
          Application.currentUser().memberships().where({organizationId: organization.id()}).fetch()
            .onSuccess(function() {
              $.bbq.pushState({view: 'invite', checkOrganization: organization.id()});
            });
        });
    }
  }
});