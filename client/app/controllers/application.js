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
    if (path == "") {
      this.switchViews(this.views.login);
    } else {
      var pathParts = _.splitAtFirstSlash(path);
      var view = this.views[pathParts[0]];
      this.switchViews(view)
      if (_.isFunction(view.navigate)) view.navigate(pathParts[1]);
    }
  },

  switchViews: function(view) {
    if (this.currentView === view) return;
    this.body.empty();
    this.body.append(view);
    this.currentView = view;
  },

  currentUserIdEstablished: function(currentUserId) {
    this.currentUserId = currentUserId;
  },

  currentUser: function() {
    return User.find(this.currentUserId);
  }
});
