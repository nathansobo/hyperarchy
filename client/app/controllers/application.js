_.constructor("Controllers.Application", {
  initialize: function(currentUserId, body) {
    this.currentUserId = currentUserId;
    this.body = body || $('body');
    this.views = {
      addOrganization: Views.AddOrganization.toView(),
      editOrganization: Views.EditOrganization.toView(),
      organizations: Views.OrganizationOverview.toView(),
      elections: Views.ElectionOverview.toView(),
      members: Views.Members.toView(),
      account: Views.Account.toView(),
      newElection: Views.NewElection.toView()
    };
  },

  initializeNavigation: function() {
    this.layout = Views.Layout.toView({views: this.views});
    $("#loadingPage").remove();
    this.body.append(this.layout);
    this.currentUserIdEstablished(this.currentUserId);
    $(window).trigger('hashchange');
    Election.updateScoresPeriodically();
  },

  currentUserIdEstablished: function(currentUserId) {
    this.currentUserId = currentUserId;
    this.layout.currentUser(this.currentUser());
  },

  currentUser: function() {
    return User.find(this.currentUserId);
  },

  currentOrganization: function() {
    return Organization.find(this.currentOrganizationId());
  },

  currentOrganizationId: {
    afterWrite: function() {
      this.layout.showOrganizationNavigationBar();
    },

    afterChange: function(organizationId, old) {
      if (this.previousOrganizationSubscription) this.previousOrganizationSubscription.destroy();
      Server.post("/subscribe_to_organization/" + organizationId, { real_time_client_id: Server.realTimeClientId() }).onSuccess(function(subscriptionId) {
        this.previousOrganizationSubscription = new Monarch.Http.RemoteSubscription(subscriptionId)
      }, this);
      this.layout.organization(this.currentOrganization());
      this.welcomeGuide.organization(this.currentOrganization());
    }
  },

  sslEnabled: function() {
    return window.location.protocol === "https:";
  }
});
