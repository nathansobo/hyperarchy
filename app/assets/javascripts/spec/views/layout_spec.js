//= require spec/spec_helper

describe("Views.Layout", function() {
  beforeEach(function() {
    renderLayout();
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
});
