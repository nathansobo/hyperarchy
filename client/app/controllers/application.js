_.constructor("Controllers.Application", {
  initialize: function(body) {
    this.body = body || $('body');
    this.views = {
      login: Views.Login.toView(),
      signup: Views.Signup.toView(),
      organizations: Views.Organizations.toView()
    };
    _.each(this.views, function(view) {
      view.hide();
      this.body.append(view);
    }, this);

    History.onChange(function(path) {
      this.navigate(path);
    }, this);
  },

  navigate: function(path) {
    if (path == "") {
      if (this.currentUserId) {
        this.switchViews(this.views.organizations);
        this.views.organizations.navigate('global');
      } else {
        this.switchViews(this.views.login);
      }
    } else {
      var pathParts = _.splitAtFirstSlash(path);
      var view = this.views[pathParts[0]];
      this.switchViews(view);
      if (_.isFunction(view.navigate)) view.navigate(pathParts[1]);
    }
  },

  switchViews: function(viewToShow) {
    _.each(this.views, function(view) {
      if (view === viewToShow) {
        view.show();
      } else {
        view.hide();
      }
    });
  },

  currentUserIdEstablished: function(currentUserId) {
    this.currentUserId = currentUserId;
  },

  currentUser: function() {
    return User.find(this.currentUserId);
  }
});
