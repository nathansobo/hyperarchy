_.constructor('Views.Pages.Organization', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div(function() {
      subview("electionsList", Views.Components.SortedList, {
        buildElement: function(election) {
          return $("<li>" + election.body() +"</li>").click(function() {
            History.pushState(null, null, election.url());
          });
        }
      })
    });
  }},

  viewProperties: {
    organization: {
      change: function(organization) {
        Application.currentOrganizationId(organization.id());
        return organization.fetchMoreElections(16)
          .success(this.bind(function() {
            this.electionsList.relation(organization.elections());
          }));
      }
    },
    
    params: {
      change: function(params) {
        var organization = Organization.find(params.organizationId) || Organization.findSocial();
        this.organization(organization);
      }
    }
  }
});
