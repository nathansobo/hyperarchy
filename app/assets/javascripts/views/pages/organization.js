_.constructor('Views.Pages.Organization', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "organization"}, function() {

      div({id: "headline"}, function() {
        a({'class': "new button"}, "Ask A Question").ref('newElectionButton').click('newElection');
        h1("Questions Under Discussion");
      });


      div({id: "introduction"}, function() {
        h1("Introducing Hyperarchy");
        h2("A new way to gather opinions online");
        h3(function() {
          span("Ask questions. Rank answers.");
          text(" ")
          span("Track results in real time.");
        });
      }).ref('introduction');

      subview("electionsList", Views.Components.SortedList, {
        buildElement: function(election) {
          return Views.Pages.Organization.ElectionLi.toView({election: election});
        }
      });
    });
  }},

  viewProperties: {
    beforeShow: function() {
      Application.removeClass('fixed-height');
    },

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
    },

    newElection: function() {
      History.pushState(null, null, this.organization().newElectionUrl());
    }
  }
});
