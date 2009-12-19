constructor("Views.Elections", View.Template, {
  content: function() { with(this.builder) {
    div({id: 'elections_view'}, function() {
      h2("elections");
      select()
        .change(function(view) {
          view.organization_changed();
        })
        .ref("organizations_select");
      br();
      br();
      input().ref("create_election_input");
      button("Create Election").click(function(view) {
        view.create_election();
      })
      ul().ref("elections_ul")
    });
  }},

  view_properties: {
    initialize: function() {
      var self = this;
      Organization.fetch()
        .after_events(function() {
          Organization.each(function(organization) {
            self.organizations_select.append_view(function(b) {
              b.option({value: organization.id()}, organization.name());
            });
          });
          self.organization_changed();  
        });
    },

    selected_organization: function() {
      return Organization.find(this.organizations_select.val());
    },

    organization_changed: function() {
      var self = this;
      this.elections = this.selected_organization().elections()
      this.elections.fetch();
//        .after_events(function() {
//          self.elections.each(function(election) {
//            self.elections_ul.append_view(function(b) {
//              b.li(election.body())
//            });
//          });
//
//          self.elections.on_insert(function(election) {
//            self.elections_ul.append_view(function(b) {
//              b.li(election.body())
//            });
//          });
//        });
    },

    create_election: function() {
      this.selected_organization().elections().create({body: this.create_election_input.val()});
    }
  }
});
