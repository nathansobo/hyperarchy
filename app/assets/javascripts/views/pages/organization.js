_.constructor('Views.Pages.Organization', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div("Org View");
  }},

  viewProperties: {
    propertyAccessors: ['organization'],

    organizationId: {
      change: function(id) {
        var organization = Organization.find(id) || Organization.findSocial();
        this.organization(organization);
      }
    },

    organization: {
      change: function(organization) {
        return organization.fetchMoreElections(16);
      }
    }
  }
});
