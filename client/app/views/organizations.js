constructor("Views.Organizations", View.Template, {
  content: function() { with(this.builder) {
    div({id: "organizations", 'class': "container12"}, function() {
      div({id: "header", 'class': "grid12"}, function() {
        div({'class': "grid2 alpha"}, function() {
          h1({id: "title"}, "hyperarchy");
        });
        div({'class': "grid2 prefix8 omega"}, function() {
          span("organization:");
          select()
            .ref("organizationSelect")
            .change(function(view) {
              view.organizationSelectChanged();
            });
        });
      });

      div({'class': "grid4"}, function() {
        subview('electionsView', Views.Elections)
      });

      div({'class': "grid4"}, function() {
        subview('rankingsView', Views.Rankings);
      });

      div({'class': "grid4"}, function() {
        subview('candidatesView', Views.Candidates);
      });
    });
  }},

  viewProperties: {
    initialize: function() {
      var self = this;
      this.electionsView.candidatesView = this.candidatesView;
      this.electionsView.rankingsView = this.rankingsView;
      this.fetchingOrganizations = Organization.fetch();
      this.fetchingOrganizations.afterEvents(function() {
        Organization.each(function(organization) {
          self.organizationSelect.appendView(function(b) {
            b.option({value: organization.id()}, organization.name());
          });
        });
        delete self.fetchingOrganizations;
      });
    },

    navigate: function(organizationId) {
      var self = this;
      if (this.fetchingOrganizations) {
        this.fetchingOrganizations.afterEvents(function() {
          self.navigate(organizationId);
        });
        return;
      }

      if (organizationId) {
        this.displayOrganization(organizationId);
      } else {
        History.load("organizations/" + Organization.first().id());
      }
    },

    displayOrganization: function(organizationId) {
      if (this.organizationSelect.val() != organizationId) this.organizationSelect.val(organizationId);
      this.electionsView.elections(Organization.find(organizationId).elections());
    },

    organizationSelectChanged: function() {
      History.load("organizations/" + this.organizationSelect.val());
    }
  }
});
