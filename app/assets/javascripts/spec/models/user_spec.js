//= require spec/spec_helper

describe("User", function() {
  var user;
  beforeEach(function() {
    user = User.createFromRemote({id: 1, emailHash: 'fake-email-hash'});
  });

  describe("#avatarUrl(size)", function() {
    describe("if the user has a facebook uid", function() {
      beforeEach(function() {
        user.facebookUid("1234");
      });

      it("returns the facebook profile picture url", function() {
        expect(user.avatarUrl(40)).toBe(user.facebookPhotoUrl());
      });
    });

    describe("if the user does not have a facebook uid", function() {
      it("returns the facebook profile picture url", function() {
        expect(user.avatarUrl(40)).toBe(user.gravatarUrl(40));
      });
    });
  });

  describe("#gravatarUrl", function() {
    it("returns a gravatar url based on the given size and the user's email hash", function() {
      expect(user.gravatarUrl()).toEqual("https://secure.gravatar.com/avatar/fake-email-hash?s=40&d=404");
    });
  });
});