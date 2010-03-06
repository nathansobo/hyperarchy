constructor("Controllers.Application", {
  initialize: function(body) {
    this.body = body || $('body');
    this.views = {
      login: Views.Login.toView(),
      signup: Views.Signup.toView(),
      organization: Views.Organization.toView()
    };
    History.onChange(function(path) {
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

  currentUserIdEstablished: function(currentUserId) {
    this.currentUserId = currentUserId;
  }
});
