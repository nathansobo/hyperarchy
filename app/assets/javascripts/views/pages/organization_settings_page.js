_.constructor('Views.Pages.OrganizationSettings', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: 'organization-settings'}, function() {

    });
  }},

  viewProperties: {
    params: {
      change: function(params) {
        return this.organization(Organization.find(params.organizationId));
      }
    },

    organization: {
      change: function(organization) {
        return organization.memberships().joinTo(User).fetch();
      }
    }
  }
});
