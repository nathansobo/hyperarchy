//= require spec/spec_helper

describe("Views.Components.Avatar", function() {
  var avatar;
  beforeEach(function() {
    window.Application = Views.Layout.toView();
    avatar = Views.Components.Avatar.toView({imageSize: 25});
  });

  describe("#initialize", function() {
    it("assigns the height and width to the given size", function() {
      expect(avatar.css('height')).toBe('25px');
      expect(avatar.css('width')).toBe('25px');
    });
  });

  describe("#user", function() {
    var user, avatarUrlPromise;
    beforeEach(function() {
      user = User.createFromRemote({id: 1, emailHash: "asf"});
      avatarUrlPromise = new Monarch.Promise();
      spyOn(user, 'fetchAvatarUrl').andReturn(avatarUrlPromise);
    });

    it("sets the src attribute to the url for that user's avatar", function() {
      avatar.user(user);

      expect(user.fetchAvatarUrl).toHaveBeenCalled();

      avatarUrlPromise.triggerSuccess("https://twitter.com/image")
      expect(avatar.img.attr('src')).toBe("https://twitter.com/image");
    });

    describe("if the user's avatar image loads successfully", function() {
      it("appends the image to the view", function() {
        avatar.user(user);
        avatarUrlPromise.triggerSuccess("https://twitter.com/image")

        expect(avatar).not.toContain('img');
        expect(avatar).not.toHaveClass('valid-avatar');

        avatar.img.trigger("load");

        expect(avatar).toContain('img');
        expect(avatar).toHaveClass('valid-avatar');

        var otherUser = User.createFromRemote({id: 2, emailHash: "oaneuth"})
        avatar.user(otherUser);
        expect(avatar).not.toHaveClass('valid-avatar');
        avatar.img.trigger("load");
        expect(avatar).toHaveClass('valid-avatar');
      });
    });
  });
});
