_.constructor("Controllers.Application", {
  initialize: function(currentUserId, body) {
    this.currentUserId = currentUserId;
    this.body = body || $('body');
    this.views = {
      login: Views.Login.toView(),
      signup: Views.Signup.toView(),
      addOrganization: Views.AddOrganization.toView(),
      editOrganization: Views.EditOrganization.toView(),
      organizations: Views.OrganizationOverview.toView(),
      elections: Views.ElectionOverview.toView(),
      invite: Views.Invite.toView()
    };
    this.layout = Views.Layout.toView({views: this.views});
    this.body.append(this.layout);
  },

  initializeNavigation: function() {
    $(window).trigger('hashchange');
  },

  currentUserIdEstablished: function(currentUserId) {
    this.currentUserId = currentUserId;
  },

  currentUser: function() {
    return User.find(this.currentUserId);
  }
});
