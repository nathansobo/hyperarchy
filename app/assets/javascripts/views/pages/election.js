_.constructor('Views.Pages.Election', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div(function() {
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
      change: function(organization) {
      }
    }
  }
});
