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
    this.socket = new io.Socket("localhost", {rememberTransport: false, port: 8080 });
    this.socket.connect();

    var socket = this.socket;
    this.socket.on('connect', function() {
      console.debug("connected!! ");
      console.debug(socket.transport.sessionid);

    });
    this.socket.on('message', function(m) {
      console.debug("got message", m);
    });
    this.socket.on('disconnect', function() {
      console.debug('disconnected!!');
    });
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

      this.delay(function() {
        console.log('posting', this.socket.transport.sessionid);
        $.post('/channel_subscriptions/organizations/' + organizationId, { session_id: this.socket.transport.sessionid });
      }, 4000);

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
