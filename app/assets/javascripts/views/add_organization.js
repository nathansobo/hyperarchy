_.constructor("Views.AddOrganization", Views.Lightbox, {
  lightboxContent: function() { with(this.builder) {
    div(function() {

      h1("Add Your Organization")

      div({'class': "clear"});

      div({id: "addOrganizationForm"}, function() {
        label({'for': "name"}, "Organization Name");
        input({name: "name", 'class': "text"}).ref('organizationName');
        label({'for': "description"}, "Description (Optional)");
        textarea({name: "description", 'class': "text"});
        a({href: "#", 'class': "glossyBlack roundedButton"}, "Add This Organization")
          .ref('createOrganizationButton')
          .click('createOrganization');
      })

      div({id: "addOrganizationDescription"}, template.descriptionText());

      div({'class': "clear"});
    });
  }},

  id: "addOrganization",

  descriptionText: function() {
    return "By adding your organization, you create a private area where your team can raise questions, make suggestions, and vote on issues.";
  },

  viewProperties: {
    viewName: 'addOrganization',

    initialize: function() {
      this.find('input').bind('keydown', 'return', this.hitch('createOrganization'));
    },

    createOrganization: function() {
      if (this.organizationName.val() === "") return false;

      Organization.create(this.fieldValues())
        .onSuccess(function(organization) {
          Application.currentUser().memberships().where({organizationId: organization.id()}).fetch()
            .onSuccess(function() {
              $.bbq.pushState({view: 'newElection', organizationId: organization.id()});
            });
        });
    }
  }
});