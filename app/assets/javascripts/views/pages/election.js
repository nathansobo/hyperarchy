_.constructor('Views.Pages.Election', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div(function() {
    });
  }},

  viewProperties: {
    id: {
      change: function(id) {
      }
    },

    election: {
      change: function(organization) {
      }
    }
  }
});
