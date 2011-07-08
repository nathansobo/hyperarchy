//= require spec/spec_helper

describe("Views.Layout", function() {
  beforeEach(function() {
    attachLayout();
  });

  describe("#initialize", function() {
    it("connects to the socket server and sets up the client to send mutation messages to the repository", function() {
      expect(socketClient.connect).toHaveBeenCalled();

      var createCommand = ['create', 'questions', {id: 1, body: "What up now?"}];
      socketClient.emit('message', [JSON.stringify(createCommand)]);

      expect(Question.find(1).body()).toBe("What up now?");

      var updateCommand = ['update', 'questions', 1, {body: "What up later?"}];
      socketClient.emit('message', [JSON.stringify(updateCommand)]);
      expect(Question.find(1).body()).toBe("What up later?");

      var updateCommand = ['destroy', 'questions', 1];
      socketClient.emit('message', [JSON.stringify(updateCommand)]);
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
      organization1 = Organization.createFromRemote({id: 1, name: "Fujimoto's"});
      organization2 = Organization.createFromRemote({id: 2, name: "Hey Ya"});
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
        $('#jasmine_content').html(Application);

        var social = Organization.createFromRemote({id: 3, name: "Hyperarchy Social", social: true});

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
    it("shows the disconnect lightbox", function() {
      $("#jasmine_content").html(Application);

      expect(Application.disconnectDialog).toBeHidden();
      expect(Application.darkenedBackground).toBeHidden();
      socketClient.emit('disconnect');
      expect(Application.disconnectDialog).toBeVisible();
      expect(Application.darkenedBackground).toBeVisible();
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
});
