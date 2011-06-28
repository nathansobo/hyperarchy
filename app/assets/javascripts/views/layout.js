_.constructor("Views.Layout", View.Template, {
  content: function() { with(this.builder) {
    div({id: "layout"}, function() {
      div({id: "body-wrapper"}, function() {
        div({id: "header"}, function() {
          h1("HYPERARCHY");
          div({id: "menu-items"}, function() {
            subview('organizationsMenu', Views.Layout.OrganizationsMenu);
            subview('accountMenu', Views.Layout.AccountMenu);
          });
        });

        div({id: "body"}, function() {
          subview('organizationPage', Views.Pages.Organization);
          subview('electionPage', Views.Pages.Election);
        }).ref("body");
      });

      div({id: "lightboxes"}, function() {
        subview("loginForm", Views.Lightboxes.LoginForm);
        subview("signupForm", Views.Lightboxes.SignupForm);
        subview("disconnectDialog", Views.Lightboxes.DisconnectDialog);
      }).ref("lightboxes");

      div({id: "darkened-background"}).ref("darkenedBackground");
    });
  }},

  viewProperties: {
    lineHeight: 19,

    initialize: function() {
      this.currentUserChangeNode = new Monarch.SubscriptionNode();
      this.connectToSocketServer();

      $(document).bind('keydown', 'ctrl+g', function() {
        $('body').toggleClass('grid');
      });
      $(document).bind('keydown', 'ctrl+shift+g', function() {
        $('body').toggleClass('grid-offset');
      });
    },

    currentUser: {
      change: function(user) {
        this.currentUserId(user.id());
        return this.currentUserChangeNode.publishForPromise(user);
      }
    },

    currentUserId: {
      change: function(currentUserId) {
        return this.currentUser(User.find(currentUserId));
      }
    },

    onCurrentUserChange: function(callback, context) {
      this.currentUserChangeNode.subscribe(callback, context);
    },

    currentOrganizationId: {
      change: function(currentOrganizationId) {
        this.socketConnectionFuture.success(function(sessionId) {
          $.post('/channel_subscriptions/organizations/' + currentOrganizationId, { session_id: sessionId });
        });
      }
    },

    currentOrganization: function() {
      return Organization.find(this.currentOrganizationId());
    },

    showPage: function(name, params) {
      this.body.children().hide();
      var parsedParams = {};
      _.each(params, function(value, key) {
        parsedParams[key] = (value !== 'new') ? parseInt(value) : value;
      });
      this[name + 'Page'].show().params(parsedParams);
    },

    connectToSocketServer: function() {
      this.socketConnectionFuture = new Monarch.Http.AjaxFuture();
      var socketServerHost = window.location.hostname;
      var socket = new io.Socket(socketServerHost, {rememberTransport: false, secure: true, port: 8081});
      socket.on('connect', this.bind(function() {
        this.socketConnectionFuture.triggerSuccess(socket.transport.sessionid);
      }));
      socket.on('message', function(m) {
        Repository.mutate([JSON.parse(m)]);
      });
      socket.on('disconnect', this.bind(function() {
        this.disconnectDialog.show();
      }));

      socket.connect();
    },

    reload: function() {
      window.location.reload();
    },

    promptSignup: function() {
      var promise = new Monarch.Promise();

      function onSuccess() {
        promise.triggerSuccess();
        unbindHandlers();
      }

      function onCancel() {
        promise.triggerInvalid();
        unbindHandlers();
      }

      var unbindHandlers = this.bind(function() {
        this.signupForm.unbind('success', onSuccess);
        this.signupForm.unbind('cancel', onCancel);
        this.loginForm.unbind('success', onSuccess);
        this.loginForm.unbind('cancel', onCancel);
      });

      this.loginForm.one('success', onSuccess);
      this.signupForm.one('success', onSuccess);
      this.loginForm.one('cancel', onCancel);
      this.signupForm.one('cancel', onCancel);

      this.signupForm.show();
      return promise;
    }
  }
});
