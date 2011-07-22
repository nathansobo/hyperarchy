//= require spec/spec_helper

describe("Views.Layout", function() {
  beforeEach(function() {
    attachLayout();
  });

  describe("#initialize", function() {
    it("connects to the socket server and sets up the client to send mutation messages to the repository", function() {
      expect(socketClient.connect).toHaveBeenCalled();

      var createCommand = ['create', 'questions', {id: 1, body: "What up now?"}];
      socketClient.emit('message', [JSON.stringify([createCommand])]);

      expect(Question.find(1).body()).toBe("What up now?");

      var updateCommand = ['update', 'questions', 1, {body: "What up later?"}];
      socketClient.emit('message', [JSON.stringify([updateCommand])]);
      expect(Question.find(1).body()).toBe("What up later?");

      var updateCommand = ['destroy', 'questions', 1];
      socketClient.emit('message', [JSON.stringify([updateCommand])]);
      expect(Question.find(1)).toBeUndefined();
    });

    it("sets up the question scores to be updated periodically", function() {
      expect(Question.updateScoresPeriodically).toHaveBeenCalled();
    });
  });

  describe("#currentUser and #currentUserId", function() {
    var organization, user1, user2

    beforeEach(function() {
      organization = Organization.createFromRemote({id: 1});
      user1 = organization.makeMember({id: 1});
      user2 = organization.makeMember({id: 2});
    });

    it("updates lastVisited for the current user's membership to the current organization if they aren't a guest", function() {
      Application.currentOrganization(organization);
      useFakeServer();
      freezeTime();

      Application.currentUser(user1);
      var user1Membership = organization.membershipForUser(user1);
      expect(Server.updates.length).toBe(1);
      expect(Server.lastUpdate.record).toBe(user1Membership);
      Server.lastUpdate.simulateSuccess();
      expect(user1Membership.lastVisited()).toBe(new Date());

      Application.currentUser(user2);
      var user2Membership = organization.membershipForUser(user2);
      expect(Server.updates.length).toBe(1);
      expect(Server.lastUpdate.record).toBe(user2Membership);
      Server.lastUpdate.simulateSuccess();
      expect(user2Membership.lastVisited()).toBe(new Date());
    });

    it("assigns currentUserId when currentUser is assigned and vice versa", function() {
      Application.currentUserId(user1.id());
      expect(Application.currentUserId()).toEqual(user1.id());
      expect(Application.currentUser()).toEqual(user1);

      Application.currentUser(user2);
      expect(Application.currentUserId()).toEqual(user2.id());
      expect(Application.currentUser()).toEqual(user2);

      Application.currentUser(user2);
      expect(Application.currentUserId()).toEqual(user2.id());
      expect(Application.currentUser()).toEqual(user2);
    });
  });

  describe("#currentOrganization / #currentOrganizationId", function() {
    var organization1, organization2, member, guest, membership;

    beforeEach(function() {
      organization1 = Organization.createFromRemote({id: 1, name: "Fujimoto's", privacy: "private"});
      organization2 = Organization.createFromRemote({id: 2, name: "Hey Ya", privacy: "public"});
      guest = User.createFromRemote({id: 11, guest: true});
      member = User.createFromRemote({id: 12, guest: false});
      membership = member.memberships().createFromRemote({id: 9, organizationId: organization1.id()});
      guest.memberships().createFromRemote({id: 9, organizationId: organization2.id()});
      Application.currentUser(guest);
    });

    describe("#currentOrganizationId", function() {
      describe("when the socket client has finished connecting", function() {
        beforeEach(function() {
          socketClient.transport.sessionid = 'fake-session-id';
          socketClient.emit('connect');
        });

        it("subscribes to the organization's channel", function() {
          Application.currentOrganizationId(organization2.id());
          expect(jQuery.ajax).toHaveBeenCalledWith({
            type : 'post',
            url : '/channel_subscriptions/organizations/' + organization2.id(),
            data : { session_id : 'fake-session-id' },
            success: undefined,
            dataType: undefined
          });
        });
      });

      describe("when the socket client has not yet connected", function() {
        it("subscribes to the organization's channel after the client connects", function() {
          Application.currentOrganizationId(organization2.id());

          expect(jQuery.ajax).not.toHaveBeenCalled();

          socketClient.transport.sessionid = 'fake-session-id';
          socketClient.emit('connect');

          expect(jQuery.ajax).toHaveBeenCalledWith({
            type : 'post',
            url : '/channel_subscriptions/organizations/' + organization2.id(),
            data : { session_id : 'fake-session-id' },
            success: undefined,
            dataType: undefined
          });
        });
      });
    });

    describe("#currentOrganization", function() {
      it("it changes the organization name or hides it when viewing social", function() {
        var social = Organization.createFromRemote({id: 3, name: "Hyperarchy Social", social: true, privacy: "public"});

        $('#jasmine_content').html(Application);

        Application.currentOrganizationId(organization1.id());
        expect(Application.organizationName).toBeVisible();
        expect(Application.organizationNameSeparator).toBeVisible();
        expect(Application.organizationName.text()).toBe(organization1.name());

        Application.currentOrganizationId(social.id());
        expect(Application.organizationName).toBeHidden();
        expect(Application.organizationNameSeparator).toBeHidden();

        Application.currentOrganizationId(organization2.id());
        expect(Application.organizationName).toBeVisible();
        expect(Application.organizationNameSeparator).toBeVisible();
        expect(Application.organizationName.text()).toBe(organization2.name());
      });

      it("updates the visited_at field of the current user's membership to this organization if they aren't a guest", function() {
        freezeTime();
        useFakeServer();

        Application.currentUser(member);
        Application.currentOrganization(organization1);

        expect(Server.updates.length).toBe(1);
        expect(Server.lastUpdate.record).toBe(membership);
        Server.lastUpdate.simulateSuccess();
        expect(membership.lastVisited()).toBe(new Date());

        Application.currentUser(guest);
        Application.currentOrganization(organization2);
        expect(Server.updates.length).toBe(0);
      });
    });

    it("assigns currentOrganizationId when currentOrganization is assigned and vice versa", function() {
      Application.currentOrganization(organization1);
      expect(Application.currentOrganizationId()).toBe(organization1.id());
      Application.currentOrganizationId(organization2.id());
      expect(Application.currentOrganization()).toBe(organization2);
    });
  });

  describe("when the socket client is disconnected", function() {
    beforeEach(function() {
      $("#jasmine_content").html(Application);
      Application.currentOrganization(Organization.createFromRemote({id: 1}));

      expect(Application.disconnectDialog).toBeHidden();
      expect(Application.darkenedBackground).toBeHidden();

      spyOn(window, 'setTimeout').andReturn('timeoutHandle');
      spyOn(window, 'clearTimeout');

      socketClient.transport.sessionid = 'fake-session-id';
      socketClient.emit('connect');

      socketClient.emit('disconnect');
      expect(window.setTimeout).toHaveBeenCalled();

      expect(Application.disconnectDialog).toBeHidden();
      expect(Application.darkenedBackground).toBeHidden();
    });

    describe("if the client reconnects before the timeout occurs", function() {
      it("cancels the timeout and resubscribes to the current organization with the reconnecting=1 param", function() {
        socketClient.emit('connect');

        expect(jQuery.ajax).toHaveBeenCalledWith({
          type : 'post',
          url : '/channel_subscriptions/organizations/' + Application.currentOrganizationId(),
          data : { session_id : 'fake-session-id', reconnecting: 1 },
          success: undefined,
          dataType: undefined
        });

        expect(window.clearTimeout).toHaveBeenCalledWith('timeoutHandle');
      });
    });

    describe("if the timeout occurs before the client reconnects", function() {
      it("shows the disconnect lightbox and sends an event to mixpanel", function() {
        window.setTimeout.mostRecentCall.args[0]();

        expect(mpq.pop()).toEqual(["track", "Reconnect Timeout"]);

        expect(Application.disconnectDialog).toBeVisible();
        expect(Application.darkenedBackground).toBeVisible();
      });
    });
  });

  describe("when the logo is clicked", function() {
    it("navigates to the current org", function() {
      spyOn(Application, 'showPage');
      var org = Organization.createFromRemote({id: 1, name: "Boboland"});
      Application.currentOrganization(org);

      Application.logoAndTitle.click()
      expect(Path.routes.current).toBe(org.url());
    });
  });

  describe("when the feedback link is clicked", function() {
    it("shows the feedback form", function() {
      $("#jasmine_content").html(Application);
      Application.feedbackLink.click();
      expect(Application.feedbackForm).toBeVisible();
    });
  });

  describe("the invite link", function() {
    it("shows the invite link only for private organizations, and shows the invite box with the org's secret url when it is clicked", function() {
      $('#jasmine_content').html(Application);
      var privateOrg = Organization.createFromRemote({id: 1, name: "Private Eyes", privacy: "private"});
      var publicOrg = Organization.createFromRemote({id: 2, name: "Public Enemies", privacy: "public"});
      var user = privateOrg.makeMember({id: 1});
      spyOn(privateOrg, 'secretUrl').andReturn('/this_is_so_secret');
      Application.currentUser(user);

      Application.currentOrganization(publicOrg);
      expect(Application.inviteLink).not.toBeVisible();

      Application.currentOrganization(privateOrg);
      expect(Application.inviteLink).toBeVisible();

      Application.inviteLink.click();
      var inviteBox = Application.inviteBox
      expect(inviteBox).toBeVisible();
      expect(inviteBox.secretUrl.val()).toBe(privateOrg.secretUrl());
      expect(inviteBox.secretUrl).toHaveFocus();

      privateOrg.remotelyUpdated({privacy: "public"});
      expect(Application.inviteLink).not.toBeVisible();

      privateOrg.remotelyUpdated({privacy: "private"});
      expect(Application.inviteLink).toBeVisible();
    });
  });

  describe("#facebookLogin", function() {
    beforeEach(function() {
      spyOn(FB, 'login');
    });

    describe("when facebook login succeeds", function() {
      describe("when the facebook uid matches that of the current user", function() {
        it("triggers the success promise immediately", function() {
          Application.currentUser(User.createFromRemote({id: 1, facebookId: '123'}));
          var promise = Application.facebookLogin();

          expect(FB.login).toHaveBeenCalled();
          var callback = FB.login.mostRecentCall.args[0];
          callback({session: { uid: '123' }});

          expect(promise.successTriggerred).toBeTruthy();
        });
      });

      describe("when the facebook uid does not match that of the current user", function() {
        it("triggers the success promise after posting to /facebook_sessions and switching the current user", function() {
          var otherUser = User.createFromRemote({id: 2, facebookId: '123'});
          Application.currentUser(User.createFromRemote({id: 1, facebookId: 'xxx'}));
          var promise = Application.facebookLogin();

          expect(FB.login).toHaveBeenCalled();
          var callback = FB.login.mostRecentCall.args[0];
          callback({session: { uid: '123' }});

          expect(promise.successTriggerred).toBeFalsy();

          expect($.ajax).toHaveBeenCalled();
          expect(mostRecentAjaxRequest.url).toBe('/facebook_sessions');
          mostRecentAjaxRequest.success({ current_user_id: otherUser.id() });

          expect(promise.successTriggerred).toBeTruthy();
          expect(Application.currentUser()).toBe(otherUser);
        });
      });
    });

    describe("when facebook login fails", function() {
      it("triggers invalid on the promise and does not change the current user", function() {
        var promise = Application.facebookLogin();
        expect(FB.login).toHaveBeenCalled();
        var loginCallback = FB.login.mostRecentCall.args[0];
        loginCallback({ session: null }); // simulate unsuccessful FB login

        expect(promise.invalidTriggerred).toBeTruthy();
        expect(Application.currentUser().defaultGuest()).toBeTruthy();
      });
    });
  });

  describe("#twitterLogin", function() {
    beforeEach(function() {
      spyOn(T, 'signIn');
    });

    describe("when the twitter id matches that of the current user", function() {
      it("triggers the success promise immediately", function() {
        Application.currentUser(User.createFromRemote({id: 1, twitterId: 123}));
        var promise = Application.twitterLogin()

        expect(T.signIn).toHaveBeenCalled();
        T.trigger('authComplete', {}, { id: 123, name: "Max Brunsfeld" });

        expect(promise.successTriggerred).toBeTruthy();
      });
    });

    describe("when the twitter_id does not match that of the current user", function() {
      it("triggers the success promise after posting to /facebook_sessions and switching the current user", function() {
        var otherUser = User.createFromRemote({id: 2, twitterId: '123'});
        Application.currentUser(User.createFromRemote({id: 1, twitterId: '456'}));
        var promise = Application.twitterLogin()

        expect(T.signIn).toHaveBeenCalled();

        T.trigger('authComplete', {}, { id: 123, name: "Max Brunsfeld" });

        expect(promise.successTriggerred).toBeFalsy();

        expect($.ajax).toHaveBeenCalled();
        expect(mostRecentAjaxRequest.url).toBe('/twitter_sessions');
        expect(mostRecentAjaxRequest.data).toEqual({name: "Max Brunsfeld"});
        mostRecentAjaxRequest.success({ current_user_id: otherUser.id() });

        expect(promise.successTriggerred).toBeTruthy();
        expect(Application.currentUser()).toBe(otherUser);
      });
    });
  });

  describe("mixpanel tracking", function() {
    describe("when the current user changes", function() {
      var organization, member, guest;

      beforeEach(function() {
        organization = Organization.createFromRemote({id: 1, name: "Data Miners"});
        member = organization.makeMember({guest: false, firstName: "Phillip", lastName: "Seymour", id: 1});
        guest  = organization.makeMember({guest: true, id: 2});
      });

      describe("if the user is NOT a guest", function() {
        it("identifies the user for mixpanel tracking and sends a Login event", function() {
          Application.currentUser(member);
          expect(mpq.length).toBe(3);
          var identifyEvent = _.select(mpq, function(event) { return event[0] === 'identify'})[0];
          var nameTagEvent = _.select(mpq, function(event) { return event[0] === 'name_tag'})[0];
          var loginEvent = _.select(mpq, function(event) { return event[1] === 'Login'})[0];

          expect(identifyEvent).toBeTruthy();
          expect(nameTagEvent).toBeTruthy();
          expect(loginEvent).toBeTruthy();
          expect(identifyEvent[1]).toBe(member.id());
          expect(nameTagEvent[1]).toBe(member.fullName());
        });
      });

      describe("if the current user is a guest", function() {
        it("does not push to the mixpanel queue", function() {
          Application.currentUser(guest);
          expect(mpq.length).toBe(0);
        });
      });
    });

    describe("when the user logs into facebook", function() {
      beforeEach(function() {
        spyOn(FB, 'login');
      });

      describe("when the facebook uid matches that of the current user", function() {
        it("does not send events to mixpanel", function() {
          Application.currentUser(User.createFromRemote({id: 1, facebookId: '123'}));
          mpq = [];
          Application.facebookLogin();
          var callback = FB.login.mostRecentCall.args[0];
          callback({session: { uid: '123' }});

          expect(mpq.length).toBe(0);
        });
      });

      describe("when the facebook uid does not match that of the current user", function() {
        it("pushes a 'Facebook Login' event to the mixpanel queue", function() {
          var otherUser = User.createFromRemote({id: 2, facebookId: '123'});
          Application.currentUser(User.createFromRemote({id: 1, facebookId: 'xxx'}));
          mpq = [];
          Application.facebookLogin();
          var callback = FB.login.mostRecentCall.args[0];
          callback({session: { uid: '123' }});
          mostRecentAjaxRequest.success({ current_user_id: otherUser.id() });

          var facebookConnectEvent = mpq[0];
          expect(facebookConnectEvent[0]).toBe('track');
          expect(facebookConnectEvent[1]).toBe('Facebook Login');
        });
      });
    });
  });
});
