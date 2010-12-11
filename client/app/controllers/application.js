_.constructor("Controllers.Application", {
  initialize: function(currentUserId, body) {
    this.currentUserId = currentUserId;
    this.body = body || $('body');
    this.views = {
      addOrganization: Views.AddOrganization.toView(),
      editOrganization: Views.EditOrganization.toView(),
      organizations: Views.OrganizationOverview.toView(),
      elections: Views.ElectionOverview.toView(),
      account: Views.Account.toView()
    };
    // don't render the view until initializeNavigation is called,
    // so that the Application global is assigned.
  },

  initializeNavigation: function() {
    this.layout = Views.Layout.toView({views: this.views});
    this.body.append(this.layout);
    $(window).trigger('hashchange');
  },

  currentUserIdEstablished: function(currentUserId) {
    this.currentUserId = currentUserId;
  },

  currentUser: function() {
    return User.find(this.currentUserId);
  },

  currentOrganization: function() {
    return Organization.find(this.currentOrganizationId());
  },

  currentOrganizationId: {
    afterChange: function(organizationId) {
      Server.post("/subscribe_to_organization/" + organizationId, { real_time_client_id: Server.realTimeClientId() });
      this.layout.organization(this.currentOrganization());
      this.welcomeGuide.organization(this.currentOrganization());
    }
  }
});
