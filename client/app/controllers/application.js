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
  },

  initializeNavigation: function() {
    if (this.changeProtocolIfNeeded()) return;
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
    afterWrite: function() {
      this.layout.showOrganizationHeader();
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

  changeProtocolIfNeeded: function() {
    if (this.sslEnabled() && !this.sslNeededForCurrentUrl()) {
      return this.disableSsl();
    } else if (!this.sslEnabled() && this.sslNeededForCurrentUrl()) {
      return this.enableSsl();
    } else {
      return false;
    }
  },

  sslNeededForCurrentUrl: function() {
    if (!this.mayNeedSsl) return false;
    var state = $.bbq.getState();
    if (state.view === "account") return true;
    if (state.organizationId && Organization.find(state.organizationId).useSsl()) return true;
    if (state.electionId && _.include(this.sslElectionIds, parseInt(state.electionId))) return true;
    return false;
  },

  sslEnabled: function() {
    return window.location.protocol === "https:";
  },

  enableSsl: function() {
    if (this.environment === "development" && window.location.hostname === "localhost") {
      if (window.console) console.debug("Switch to https would have occurred but is disabled for 'localhost' in development environment");
      return false;
    };
    window.location = window.location.href.replace("http:", "https:");
    return true;
  },

  disableSsl: function() {
    window.location = window.location.href.replace("https:", "http:");
    return true;
  }
});
