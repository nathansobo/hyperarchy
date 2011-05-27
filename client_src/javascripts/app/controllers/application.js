_.constructor("Controllers.Application", {
  initialize: function(currentUserId, body) {
    this.currentUserId = currentUserId;
    this.body = body || $('body');
    this.views = {
      editOrganization: Views.EditOrganization.toView(),
      organizations: Views.OrganizationOverview.toView(),
      elections: Views.ElectionOverview.toView(),
      members: Views.Members.toView(),
      account: Views.Account.toView(),
      newElection: Views.NewElection.toView()
    };

    window.WEB_SOCKET_SWF_LOCATION = 'http://localhost:8080/socket.io/lib/vendor/web-socket-js/WebSocketMain.swf';

    this.userSwitchNode = new Monarch.SubscriptionNode();
    this.connectSocketClient();
  },

  initializeNavigation: function() {
    this.layout = Views.Layout.toView({views: this.views});
    $("#loadingPage").remove();
    this.body.append(this.layout);
    this.currentUserIdEstablished(this.currentUserId);
    $(window).trigger('hashchange');
    Election.updateScoresPeriodically();
  },

  connectSocketClient: function() {
    this.socketConnectionFuture = new Monarch.Http.AjaxFuture();
    var socketServerHost = window.location.hostname;
    var socket = new io.Socket(socketServerHost, {port: 8081});
    socket.on('connect', this.bind(function() {
      this.socketConnectionFuture.triggerSuccess(socket.transport.sessionid);
    }));
    socket.on('message', function(m) {
      Repository.mutate([JSON.parse(m)]);
    });
    socket.on('disconnect', this.bind(function() {
      this.layout.disconnectDialog.show();
    }));

    socket.connect();
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
      this.socketConnectionFuture.onSuccess(function(sessionId) {
        $.post('/channel_subscriptions/organizations/' + organizationId, { session_id: sessionId });
      });
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
