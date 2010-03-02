constructor("Controllers.Application", {
  initialize: function(body) {
    this.body = body || $('body');
    this.views = {
      login: Views.Login.to_view(),
      signup: Views.Signup.to_view(),
      organization: Views.Organization.to_view()
    };
    History.on_change(function(path) {
      this.navigate(path);
    }.bind(this));
  },

  navigate: function(path) {
    this.body.empty();
    if (path == "") {
      this.body.append(this.views.login);
    } else {
      this.body.append(this.views[path]);
    }
  },

  current_user_id_established: function(current_user_id) {
    this.current_user_id = current_user_id;
  }
});
