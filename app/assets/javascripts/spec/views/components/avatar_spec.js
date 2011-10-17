describe("Views.Components.Avatar", function() {
  var avatar;
  beforeEach(function() {
    window.Application = Views.Layout.toView();
    avatar = Views.Components.Avatar.toView({imageSize: 25});
    $("#jasmine_content").html(avatar);
  });

  describe("#initialize", function() {
    it("assigns the height and width to the given size", function() {
      expect(avatar.css('height')).toBe('25px');
      expect(avatar.css('width')).toBe('25px');
    });
  });

  describe("#user", function() {
    var user, avatarUrlPromise, avatarUrl1, avatarUrl2;

    beforeEach(function() {
      user = User.createFromRemote({id: 1, emailHash: "asf"});
      avatarUrl1 = "images/twitter_46.png";
      avatarUrl2 = "images/facebook_46.png";
      avatarUrlPromise = new Monarch.Promise();
      spyOn(user, 'fetchAvatarUrl').andReturn(avatarUrlPromise);
    });

    it("sets the src attribute to the url for that user's avatar, after the url is fetched", function() {
      avatar.user(user);
      expect(user.fetchAvatarUrl).toHaveBeenCalled();
      avatarUrlPromise.triggerSuccess(avatarUrl1)

      expect(avatar.img.attr('src')).toBe(avatarUrl1);
    });

    describe("when the user's avatar image loads successfully", function() {
      it("shows the image and hides the placeholder", function() {
        runs(function() {
          avatar.user(user);

          expect(avatar.img).toBeHidden();
          expect(avatar.placeholder).toBeVisible();

          avatarUrlPromise.triggerSuccess(avatarUrl1)

          expect(avatar.img).toBeHidden();
          expect(avatar.placeholder).toBeVisible();
          expect(avatar.img.attr('src')).toBe(avatarUrl1);
        });

        waitsFor("images to load (from local disc)", function(complete) {
          avatar.img.load(complete);
        });

        runs(function() {
          expect(avatar.img).toBeVisible();
          expect(avatar.placeholder).toBeHidden();
        });

        runs(function() {
          avatar.user(User.createFromRemote({id: 2, emailHash: "oaneuth"}));

          expect(avatar.img).toBeHidden();
          expect(avatar.placeholder).toBeVisible();

          avatarUrlPromise.triggerSuccess(avatarUrl2)

          expect(avatar.img).toBeHidden();
          expect(avatar.placeholder).toBeVisible();
          expect(avatar.img.attr('src')).toBe(avatarUrl2);
        });

        waitsFor("second image to load (from local disc)", function(complete) {
          avatar.img.load(complete);
        });

        runs(function() {
          expect(avatar.img).toBeVisible();
          expect(avatar.placeholder).toBeHidden();
        });
      });
    });
  });
});
