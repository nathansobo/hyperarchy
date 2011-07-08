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

      div({id: "list-bottom"}, function() {
        subview('spinner', Views.Components.Spinner);
      }).ref("listBottom");
    });
  }},

  viewProperties: {
    attach: function() {
      $(window).scroll(this.hitch('fetchIfNeeded'));
    },

    organization: {
      change: function(organization) {
        Application.currentOrganizationId(organization.id());
        this.electionsList.relation(null);
        this.loading(true);

        return organization.fetchMoreElections()
          .success(this.bind(function() {
            this.stopLoadingIfNeeded();
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
      Application.newElection.show();
    },

    fetchIfNeeded: function() {
      if (!this.is(':visible')) return;
      if (!this.electionsList.relation()) return;
      if (this.remainingScrollHeight() < this.listBottom.height() * 2) {
        this.organization().fetchMoreElections().success(this.hitch('stopLoadingIfNeeded'));
      }
    },

    stopLoadingIfNeeded: function() {
      if (this.organization().numElectionsFetched >= this.organization().electionCount()) {
        this.loading(false);
      }
    },

    loading: {
      change: function(loading) {
        if (loading) {
          this.spinner.show();
          this.listBottom.show();
        } else {
          this.spinner.hide();
          this.listBottom.hide();
        }
      }
    },

    remainingScrollHeight: function() {
      var doc = $(document), win = $(window);
      return doc.height() - doc.scrollTop() - win.height();
    }
  }
});
