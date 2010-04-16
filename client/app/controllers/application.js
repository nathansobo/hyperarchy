_.constructor("Controllers.Application", {
  initialize: function(currentUserId, body) {
    this.currentUserId = currentUserId;
    this.body = body || $('body');
    this.views = {
      login: Views.Login.toView(),
      signup: Views.Signup.toView(),
      organizations: Views.Organizations.toView(),
      elections: Views.Elections.toView()
    };
    this.layout = Views.Layout.toView({views: this.views});
    this.body.append(this.layout);

    History.onChange(function(path) {
      this.navigate(path);
    }, this);
  },

  navigate: function(path) {

    console.debug(path);

    if (path == "") {
      if (this.currentUserId) {
        this.switchViews(this.views.organizations);
        this.views.organizations.navigate(Organization.global().id());
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

  switchViews: function(selectedView) {
    this.layout.switchViews(selectedView);
  },

  currentUserIdEstablished: function(currentUserId) {
    this.currentUserId = currentUserId;
  },

  currentUser: function() {
    return User.find(this.currentUserId);
  }
});
