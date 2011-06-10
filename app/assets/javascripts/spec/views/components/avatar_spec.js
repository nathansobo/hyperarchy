//= require spec/spec_helper

describe("Views.Components.Avatar", function() {

  var avatar;
  beforeEach(function() {
    window.Application = Views.Layout.toView();
    avatar = Views.Components.Avatar.toView({size: 25});
  });

  describe("#initialize", function() {
    it("assigns the height and width to the given size", function() {
      expect(avatar.css('height')).toBe('25px');
      expect(avatar.css('width')).toBe('25px');
    });
  });

  describe("#user", function() {
    var user;
    beforeEach(function() {
      user = User.createFromRemote({id: 1, emailHash: "asf"});
    });

    it("sets the src attribute to the url for that user's gravatar", function() {
      avatar.user(user);
      expect(avatar.img.attr('src')).toBe(user.gravatarUrl(25));
    });

    describe("if the user's gravatar image loads successfully", function() {
      it("appends the image to the view", function() {
        avatar.user(user);
        expect(avatar).not.toContain('img');
        avatar.img.trigger("load");
        expect(avatar).toContain('img');
        expect(avatar).toHaveClass('valid-gravatar');
      });
    });
  });
});
