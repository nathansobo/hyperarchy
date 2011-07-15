_.constructor("Views.Layout", View.Template, {
  content: function() { with(this.builder) {
    div({id: "layout"}, function() {
      div({id: 'gradient-background'});
      div({id: "body-wrapper"}, function() {
        div({id: "header"}, function() {
          a(function() {
            div({id: "logo"})
            h1("HYPERARCHY");
            h2("/").ref('organizationNameSeparator');
            h2().ref('organizationName');
          }).ref('logoAndTitle').click('navigateToCurrentOrganization');

          div({id: "menu-items"}, function() {
            a({id: "feedback-link"}, "Feedback").ref('feedbackLink').click('showFeedbackForm');
            a({id: "invite-link"}, "Invite Your Team").ref('inviteLink').click('showInviteBox');

            div({id: "organization-and-account"}, function() {
              subview('organizationsMenu', Views.Layout.OrganizationsMenu);
              subview('accountMenu', Views.Layout.AccountMenu);
            });
          });
        });

        div({id: "body"}, function() {
          subview('accountPage', Views.Pages.Account);
          subview('organizationPage', Views.Pages.Organization);
          subview('organizationSettingsPage', Views.Pages.OrganizationSettings);
          subview('questionPage', Views.Pages.Question);
        }).ref("body");
      });

      div({id: "lightboxes"}, function() {
        subview("loginForm", Views.Lightboxes.LoginForm);
        subview("feedbackForm", Views.Lightboxes.FeedbackForm);
        subview("signupForm", Views.Lightboxes.SignupForm);
        subview("newQuestion", Views.Lightboxes.NewQuestion);
        subview("disconnectDialog", Views.Lightboxes.DisconnectDialog);
        subview("inviteBox", Views.Lightboxes.InviteBox);
        subview("addOrganizationForm", Views.Lightboxes.AddOrganizationForm);
      }).ref("lightboxes");

      div({id: "darkened-background"}).ref("darkenedBackground");
    });
  }},

  viewProperties: {
    lineHeight: 18,

    initialize: function() {
      this.currentUserChangeNode = new Monarch.SubscriptionNode();
      this.connectToSocketServer();
      Question.updateScoresPeriodically();

      $(document).bind('keydown', 'ctrl+g', function() {
        $('body').toggleClass('grid');
      });
      $(document).bind('keydown', 'ctrl+shift+g', function() {
        $('body').toggleClass('grid-offset');
      });
    },

    currentUserEstablished: function(promise, data) {
      this.loginForm.hide();
      this.signupForm.hide();

      var newOrganizationId = data.new_organization_id;
      if (newOrganizationId) {
        History.pushState(null, null, Organization.find(newOrganizationId).url());
      }

      if (Application.currentUserId() !== data.current_user_id) {
        Application.currentUserId(data.current_user_id).success(function() {
          this.loginForm.trigger('success');
          this.signupForm.trigger('success');
          promise.triggerSuccess();
        }, this);
      } else {
        promise.triggerSuccess();
      }
    },

    facebookLogin: function(addOrgAfter) {
      var promise = new Monarch.Promise();

      FB.login(this.bind(function(response) {
        if (response.session) {
          if (response.session.uid === Application.currentUser().facebookUid()) {
            promise.triggerSuccess();
          } else {
            $.ajax({
              type: 'post',
              url: '/facebook_sessions',
              dataType: 'data+records', // do not use records!, because a non-fb-connected member might switch to an fb-connected member and we don't want to nuke needed data
              success: this.bind(function(data) {
                this.currentUserEstablished(promise, data);
                if (addOrgAfter) this.addOrganizationForm.show();
              })
            });
          }
        } else {
          this.signupForm.close();
          this.loginForm.close();
          promise.triggerInvalid();
        }
      }), {perms: "email"});

      return promise;
    },

    currentUser: {
      write: function(newUser, oldUser) {
        if (newUser === oldUser) {
          return new Monarch.Promise().triggerSuccess();
        } else {
          this.currentUserId(newUser.id());
          this.recordOrganizationVisit();
          return this.currentUserChangeNode.publishForPromise(newUser);
        }
      }
    },

    currentUserId: {
      write: function(currentUserId) {
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

        this.currentOrganization(Organization.find(currentOrganizationId));
      }
    },

    currentOrganization: {
      change: function(organization) {
        if (!organization) return;
        this.currentOrganizationId(organization.id());
        if (organization.social()) {
          this.organizationNameSeparator.hide();
          this.organizationName.hide();
        } else {
          this.organizationNameSeparator.show();
          this.organizationName.show();
          this.organizationName.bindText(organization, 'name');
        }

        this.registerInterest(organization, 'onUpdate', this.showOrHideIniviteLink);
        this.showOrHideIniviteLink();
        this.recordOrganizationVisit();
      }
    },

    recordOrganizationVisit: function() {
      if (!this.currentOrganization() || Application.currentUser().guest()) return;
      var membership = this.currentOrganization().membershipForUser(Application.currentUser());
      if (membership) membership.update({lastVisited: new Date()});
    },

    showPage: function(name, params) {
      this.lightboxes.children().hide();
      this.body.children().each(function() {
        $(this).view().hide();
      });
      this.removeClass('normal-height');

      var parsedParams = {};
      _.each(params, function(value, key) {
        parsedParams[key] = (value !== 'new') ? parseInt(value) : value;
      });
      var page = this[name + 'Page'];
      if (!page.fixedHeight) this.addClass('normal-height');
      page.show().params(parsedParams);
    },

    connectToSocketServer: function() {
      this.socketConnectionFuture = new Monarch.Http.AjaxFuture();
      var socketServerHost = window.location.hostname;
      var secure = (window.location.protocol === 'https:')
      var socket = new io.Socket(socketServerHost, {rememberTransport: false, secure: secure, port: 8081, connectTimeout: 10000});
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

      if (!Application.currentUser().guest()) {
        promise.triggerSuccess();
        return promise;
      }

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
    },

    promptLogin: function() {
      var promise = this.promptSignup();
      this.signupForm.loginFormLink.click();
      return promise;
    },

    navigateToCurrentOrganization: function() {
      History.pushState(null, null, this.currentOrganization().url());
    },

    showFeedbackForm: function() {
      this.feedbackForm.show();
    },

    showInviteBox: function() {
      this.inviteBox.show();
    },

    showOrHideIniviteLink: function() {
      if (this.currentOrganization().isPrivate()) {
        this.inviteLink.show();
      } else {
        this.inviteLink.hide();
      }
    },

    origin: function() {
      return window.location.protocol + "//" + window.location.host;
    }
  }
});
