constructor("Controllers.Application", {
  initialize: function(body) {
    this.body = body || $('body');
    this.views = {
      login: Views.Login.toView(),
      signup: Views.Signup.toView(),
      organizations: Views.Organizations.toView()
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
      var pathParts = path.split("/");
      var view = this.views[pathParts[0]];
      this.body.append(view);
      if (_.isFunction(view.navigate)) view.navigate(pathParts[1]);
    }
  },

  currentUserIdEstablished: function(currentUserId) {
    this.currentUserId = currentUserId;
  }
});
