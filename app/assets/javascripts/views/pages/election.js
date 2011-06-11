_.constructor('Views.Pages.Election', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "election"}, function() {
      div().ref("col1");
      div().ref("col2");
      div().ref("col3");
      div().ref("col4");
    });
  }},

  viewProperties: {
    id: {
      change: function(id) {
        return Election.findOrFetch(id)
          .success(this.hitch('election'))
          .invalid(function() {
            History.pushState(null, null, Application.currentUser().defaultOrganization().url());
          });
      }
    },

    election: {
      change: function(election) {
        this.id(election.id());
      }
    }
  }
});
