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

    this.userSwitchNode = new Monarch.SubscriptionNode();
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
    var user = this.currentUser();
    this.layout.currentUser(user);
    this.userSwitchNode.publish(user);
  },

  currentUser: function() {
    return User.find(this.currentUserId);
  },

  ensureCurrentUserIsMember: function() {
    var future = new Monarch.Http.AjaxFuture();
    if (this.currentUser().guest()) {
      Application.layout.signupPrompt.future = future;
      Application.layout.signupPrompt.showLoginForm();
      Application.layout.signupPrompt.show()
    } else {
      future.triggerSuccess();
    }
    return future;
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
    }
  },

  sslEnabled: function() {
    return window.location.protocol === "https:";
  },

  onUserSwitch: function(callback, context) {
    return this.userSwitchNode.subscribe(callback, context);
  }
});
