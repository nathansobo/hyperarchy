//= require spec/spec_helper

describe("Views.Layout", function() {
  var layout;
  beforeEach(function() {
    layout = Views.Layout.toView();
  });

  describe("#currentUserId", function() {
    it("assigns the currentUser", function() {
      var user = User.createFromRemote({id: 1});

      layout.currentUserId(user.id());
      expect(layout.currentUser()).toEqual(user);
    });
  });
});
