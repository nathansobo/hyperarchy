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
            .change(function(view) {
              view.organizationChanged();
            })
            .ref("organizationSelect");
        });
      });

      div({'class': "grid4"}, function() {
        subview('electionsView', Views.Elections)
      });

      div({'class': "grid4"}, function() {
        subview('rankingView', Views.Ranking);
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

      Organization.fetch()
        .afterEvents(function() {
          Organization.each(function(organization) {
            self.organizationSelect.appendView(function(b) {
              b.option({value: organization.id()}, organization.name());
            });
          });
          self.organizationChanged();  
        });
    },

    selectedOrganization: function() {
      return Organization.find(this.organizationSelect.val());
    },

    organizationChanged: function() {
      var self = this;
      this.electionsView.elections(this.selectedOrganization().elections());
    }
  }
});
