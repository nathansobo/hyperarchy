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
    $(window).trigger('hashchange');
  },

  currentUserIdEstablished: function(currentUserId) {
    this.currentUserId = currentUserId;
  },

  currentUser: function() {
    return User.find(this.currentUserId);
  }
});
