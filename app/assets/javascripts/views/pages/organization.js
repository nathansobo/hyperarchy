_.constructor('Views.Pages.Organization', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "organization"}, function() {
      div({id: "introduction"}, function() {


        h1("Introducing Hyperarchy");
        h2(function() {
          span("A new way to gather");
          text(" ");
          span("opinions online");
        });
        h3(function() {
          span("Ask questions. Rank answers.");
          text(" ");
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
    initialize: function() {
      $(window).resize(function() {
//        this.find('.election').css('width', (this.width() - 3 * Application.lineHeight) / 3);
      });
    },

    organization: {
      change: function(organization) {
        Application.currentOrganizationId(organization.id());
        return organization.fetchMoreElections(16)
          .success(this.bind(function() {
            this.electionsList.relation(organization.elections());
//            this.electionsList.masonry({
//              itemSelector: ".election"
////              columnWidth: 150,
////              gutterWidth: Application.lineHeight
//            });
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
