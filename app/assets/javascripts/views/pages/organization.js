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
    id: {
      change: function(id) {
        var organization = Organization.find(id) || Organization.findSocial();
        this.organization(organization);
      }
    },

    organization: {
      change: function(organization) {
        this.id(organization.id());
        return organization.fetchMoreElections(16)
          .success(this.bind(function() {
            this.electionsList.relation(organization.elections());
          }));
      }
    }
  }
});
