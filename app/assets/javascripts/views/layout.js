//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

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
            a({id: "blog-link", href: "http://blog.hyperarchy.com"}, "Blog / About");
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
      }).ref("bodyWrapper");

      div({id: "lightboxes"}, function() {
        subview("loginForm", Views.Lightboxes.LoginForm);
        subview("feedbackForm", Views.Lightboxes.FeedbackForm);
        subview("signupForm", Views.Lightboxes.SignupForm);
        subview("newQuestion", Views.Lightboxes.NewQuestion);
        subview("disconnectDialog", Views.Lightboxes.DisconnectDialog);
        subview("inviteBox", Views.Lightboxes.InviteBox);
        subview("addOrganizationForm", Views.Lightboxes.AddOrganizationForm);

        subview("fullScreenConsensus", Views.Lightboxes.FullScreenConsensus);
        subview("fullScreenAnswer", Views.Lightboxes.FullScreenAnswer);
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

      this.facebookInitializedNode = new Monarch.SubscriptionNode();
      this.twitterInitializedNode = new Monarch.SubscriptionNode();
    },

    attach: function($super) {
      $super();
      if (window.FB) this.facebookInitialized();
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

    facebookInitialized: {
      reader: function() {
        this.facebookInitializedNode.publish();
      },
      writer: function(callback, ctx) {
        return this.facebookInitializedNode.subscribe(callback, ctx);
      }
    },

    twitterInitialized: {
      reader: function() {
        this.twitterInitializedNode.publish();
      },
      writer: function(callback, ctx) {
        return this.twitterInitializedNode.subscribe(callback, ctx);
      }
    },


    facebookLogin: function() {
      var promise = new Monarch.Promise();

      FB.login(this.bind(function(response) {
        if (response.authResponse) {
          if (response.authResponse.uid === Application.currentUser().facebookId()) {
            promise.triggerSuccess();
          } else {
            $.ajax({
              type: 'post',
              url: '/facebook_sessions',
              dataType: 'data+records', // do not use records!, because a non-fb-connected member might switch to an fb-connected member and we don't want to nuke needed data
              success: this.bind(function(data) {
                mpq.push(['track', "Facebook Login"]);
                this.currentUserEstablished(promise, data);
              })
            });
          }
        } else {
          promise.triggerInvalid();
        }
      }), {scope: "email"});

      return promise;
    },

    twitterLogin: function() {
      var promise = new Monarch.Promise();

      T.one('authComplete', this.bind(function(e, user) {
        if (user.id === Application.currentUser().twitterId()) {
          promise.triggerSuccess();
        } else {
          $.ajax({
            type: 'post',
            url: '/twitter_sessions',
            dataType: 'data+records', // do not use records!, because a non-twitter-connected member might switch to a twitter-connected member and we don't want to nuke needed data
            data: { name: user.name },
            success: this.bind(function(data) {
//            mpq.push(['track', "Connect Twitter Account"]);
              this.currentUserEstablished(promise, data);
            })
          });
        }
      }));

      T.signIn();

      return promise;
    },

    currentUser: {
      write: function(newUser, oldUser) {
        if (newUser === oldUser) {
          return new Monarch.Promise().triggerSuccess();
        } else {
          this.currentUserId(newUser.id());
          this.recordOrganizationVisit();
          newUser.trackLogin();
          newUser.trackIdentity();
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
        var organization = Organization.find(currentOrganizationId);
        this.socketConnectionFuture.success(function(sessionId) {
          organization.subscribe({session_id: sessionId});
        });
        this.currentOrganization(organization);
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
      if (!params.fullScreen) {
        this.lightboxes.children().each(function() {
          $(this).view().hide();
        });
      }
      this.body.children().each(function() {
        $(this).view().hide();
      });
      this.removeClass('normal-height');

      var parsedParams = {};
      _.each(params, function(value, key) {
        var intValue = parseInt(value);
        parsedParams[key] = (intValue || intValue === 0) ? intValue : value;
      });
      var page = this[name + 'Page'];
      if (!page.fixedHeight) this.addClass('normal-height');
      page.show().params(parsedParams);
      _gaq.push(['_trackPageview']);
    },

    connectToSocketServer: function() {
      this.socketConnectionFuture = new Monarch.Http.AjaxFuture();
      var socketServerHost = window.location.hostname;
      var secure = (window.location.protocol === 'https:')
      var socket = new io.Socket(socketServerHost, {rememberTransport: false, secure: secure, port: 8081, connectTimeout: 10000});

      socket.on('connect', this.bind(function() {
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          Application.currentOrganization().subscribe({ session_id: socket.transport.sessionid, reconnecting: 1 });
        } else {
          this.socketConnectionFuture.triggerSuccess(socket.transport.sessionid);
        }
      }));

      socket.on('message', function(m) {
        Repository.mutate(JSON.parse(m));
      });


      socket.on('disconnect', this.bind(function() {
        this.reconnectTimeout = this.delay(function() {
          this.disconnectDialog.show();
          mpq.push(['track', "Reconnect Timeout"]);
        }, 10000);
      }));

      socket.connect();
    },

    reload: function() {
      window.location.reload();
    },

    scrollTop: function(top) {
      var win = $(window);
      return win.scrollTop.apply(win, arguments);
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
    },

    randomString: function() {
      return b64_md5(new Date().getTime().toString() + Math.random().toString(16)).substr(0, 8);
    },

    loadTwitterJs: function() {
      var anywhereLoaded, widgetsLoaded;

      $.getScript("https://platform.twitter.com/anywhere.js?v=1&id=" + this.TWITTER_ID, function() {
        twttr.anywhere(function (T) {
          window.T = T;
          anywhereLoaded = true;
          if (widgetsLoaded) {
            Application.twitterInitialized();
          }
        });
      });

      $.getScript("https://platform.twitter.com/widgets.js", function() {
        widgetsLoaded = true;
        if (anywhereLoaded) {
          Application.twitterInitialized();
        }
      });
    }
  }
});
