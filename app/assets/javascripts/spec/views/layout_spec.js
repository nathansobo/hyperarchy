//= require spec/spec_helper

describe("Views.Layout", function() {
  var layout;
  beforeEach(function() {
    layout = Views.Layout.toView();
  });


  describe("#currentUser and #currentUserId", function() {
    it("ensures consistent results regardless of which is used to assign", function() {
      var user1 = User.createFromRemote({id: 1});
      var user2 = User.createFromRemote({id: 2});

      layout.currentUserId(user1.id());
      expect(layout.currentUserId()).toEqual(user1.id());
      expect(layout.currentUser()).toEqual(user1);

      layout.currentUser(user2);
      expect(layout.currentUserId()).toEqual(user2.id());
      expect(layout.currentUser()).toEqual(user2);

      layout.currentUser(user2);
      expect(layout.currentUserId()).toEqual(user2.id());
      expect(layout.currentUser()).toEqual(user2);
    });
  });
});
