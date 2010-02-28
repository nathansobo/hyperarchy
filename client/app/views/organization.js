constructor("Views.Organization", View.Template, {
  content: function() { with(this.builder) {
    div({id: 'organization_view'}, function() {
      span("Organization:");
      select()
        .change(function(view) {
          view.organization_changed();
        })
        .ref("organization_select");
      br();
      br();

      div({id: 'elections'}, function() {
        input().ref("create_election_input");
        button("Ask").click(function(view) {
          view.create_election();
        })
        ul().ref("elections_ul")
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
      this.elections = this.selected_organization().elections()
      this.elections.fetch()
        .after_events(function() {
          self.elections.each(self.hitch('add_election_to_list'));
          self.elections.on_remote_insert(self.hitch('add_election_to_list')); 
        });
    },

    add_election_to_list: function(election) {
      this.elections_ul.append_view(function(b) {
        b.li(election.body())
      });
    },
    create_election: function() {
      this.selected_organization().elections().create({body: this.create_election_input.val()});
    }
  }
});
