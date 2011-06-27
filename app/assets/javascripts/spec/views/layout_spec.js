//= require spec/spec_helper

describe("Views.Layout", function() {
  beforeEach(function() {
    attachLayout();
  });

  describe("#initialize", function() {
    it("connects to the socket server and sets up the client to send mutation messages to the repository", function() {
      expect(socketClient.connect).toHaveBeenCalled();

      var createCommand = ['create', 'elections', {id: 1, body: "What up now?"}];
      socketClient.emit('message', [JSON.stringify(createCommand)]);

      expect(Election.find(1).body()).toBe("What up now?");

      var updateCommand = ['update', 'elections', 1, {body: "What up later?"}];
      socketClient.emit('message', [JSON.stringify(updateCommand)]);
      expect(Election.find(1).body()).toBe("What up later?");

      var updateCommand = ['destroy', 'elections', 1];
      socketClient.emit('message', [JSON.stringify(updateCommand)]);
      expect(Election.find(1)).toBeUndefined();
    });
  });

  describe("#currentUser and #currentUserId", function() {
    it("ensures consistent results regardless of which is used to assign", function() {
      var user1 = User.createFromRemote({id: 1});
      var user2 = User.createFromRemote({id: 2});

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

  describe("#organizationId", function() {
    describe("when the socket client has finished connecting", function() {
      beforeEach(function() {
        socketClient.transport.sessionid = 'fake-session-id';
        socketClient.emit('connect');
      });

      it("subscribes to the organization's channel", function() {
        Application.currentOrganizationId(22);
        expect(jQuery.ajax).toHaveBeenCalledWith({
          type : 'post',
          url : '/channel_subscriptions/organizations/22',
          data : { session_id : 'fake-session-id' },
          success: undefined,
          dataType: undefined
        });
      });
    });

    describe("when the socket client has not yet connected", function() {
      it("subscribes to the organization's channel after the client connects", function() {
        Application.currentOrganizationId(22);

        expect(jQuery.ajax).not.toHaveBeenCalled();

        socketClient.transport.sessionid = 'fake-session-id';
        socketClient.emit('connect');

        expect(jQuery.ajax).toHaveBeenCalledWith({
          type : 'post',
          url : '/channel_subscriptions/organizations/22',
          data : { session_id : 'fake-session-id' },
          success: undefined,
          dataType: undefined
        });
      });
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
});
