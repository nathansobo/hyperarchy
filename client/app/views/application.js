constructor("Views.Application", View.Template, {
  content: function() { with(this.builder) {
    div({id: 'application_view'}, function() {
      h1("hyperarchy");
      subview('main_views', Monarch.View.Templates.Multiview, {
        elections: Views.Elections,
        login: Views.Login,
        signup: Views.Signup
      })
    });
  }},

  view_properties: {
    initialize: function() {
      var self = this;
      window.Application = this;
      this.main_views.login.show();
      History.on_change(function(path) {
        self.navigate(path);
      });
    },

    navigate: function(path) {
      if (path == "") {
        this.main_views.hide_all_except('login');
      } else {
        this.main_views.hide_all_except(path);
      }
    },

    current_user_id_established: function(current_user_id) {
      this.current_user_id = current_user_id;
    }
  }
});
