//= require spec/spec_helper

describe("User", function() {
  var user;
  beforeEach(function() {
    user = User.createFromRemote({id: 1, emailHash: 'fake-email-hash'});
  });

  describe("#gravatarUrl", function() {
    it("returns a gravatar url based on the given size and the user's email hash", function() {
      expect(user.gravatarUrl()).toEqual("https://secure.gravatar.com/avatar/fake-email-hash?s=40&d=404");
    });
  });
});