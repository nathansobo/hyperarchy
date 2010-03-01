constructor("Views.Organization", View.Template, {
  content: function() { with(this.builder) {
    div({id: "organization_view", 'class': "container_12"}, function() {
      div({id: "header", 'class': "grid_12"}, function() {
        div({'class': "grid_2 alpha"}, function() {
          h1({id: "title"}, "hyperarchy");
        });
        div({'class': "grid_2 prefix_8 omega"}, function() {
          span("organization:");
          select()
            .change(function(view) {
              view.organization_changed();
            })
            .ref("organization_select");
        });
      });

      div({'class': "grid_4"}, function() {
        subview('elections_view', Views.Elections)
      });

      div({'class': "grid_4"}, function() {
        subview('candidates_view', Views.Candidates);
      });
    });
  }},

  view_properties: {
    initialize: function() {
      var self = this;
      Organization.fetch()
        .after_events(function() {
          Organization.each(function(organization) {
            self.organization_select.append_view(function(b) {
              b.option({value: organization.id()}, organization.name());
            });
          });
          self.organization_changed();  
        });
    },

    selected_organization: function() {
      return Organization.find(this.organization_select.val());
    },

    organization_changed: function() {
      var self = this;
      this.elections_view.elections(this.selected_organization().elections());
    }
  }
});
