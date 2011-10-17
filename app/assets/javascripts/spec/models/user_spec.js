describe("User", function() {
  var user;
  beforeEach(function() {
    user = User.createFromRemote({id: 1, emailHash: 'fake-email-hash'});
  });

  describe("#fetchAvatarUrl(size)", function() {
    describe("if the user has a twitter id and no facebook id", function() {
      beforeEach(function() {
        user.twitterId("1234");
      });

      it("triggers the future with the twitter avatar url after it is fetched", function() {
        var avatarUrl;

        var fetchPromise = new Monarch.Promise();
        spyOn(user, 'fetchTwitterAvatarUrl').andReturn(fetchPromise);

        user.fetchAvatarUrl(40).success(function(url) {
          avatarUrl = url;
        });

        fetchPromise.triggerSuccess("this is a url");
        expect(avatarUrl).toBe("this is a url");
      });
    });

    describe("if the user has a facebook id (even if they also have a twitter id)", function() {
      beforeEach(function() {
        user.facebookId("1234");
        user.twitterId(4579);
      });

      it("returns the facebook profile picture url", function() {
        user.fetchAvatarUrl(40).success(function(url) {
          avatarUrl = url;
        });

        expect(avatarUrl).toBe(user.facebookAvatarUrl());
      });
    });


    describe("if the user does not have a facebook id or a twitter id", function() {
      it("returns the facebook profile picture url", function() {
        user.fetchAvatarUrl(40).success(function(url) {
          avatarUrl = url;
        });

        expect(avatarUrl).toBe(user.gravatarUrl());
      });
    });
  });

  describe("twitter functionality", function() {
    beforeEach(function() {
      user.remotelyUpdated({twitterId: 1234});
    });

    describe("#fetchTwitterAvatarUrl", function() {
      it("performs at most one request to the twitter api for the user data and triggers the promise with the modified url (so we fetch a 'bigger' image)", function() {
        var promise1Url, promise2Url;

        user.fetchTwitterAvatarUrl().success(function(url) {
          promise1Url = url;
        });
        expect($.ajax).toHaveBeenCalled();

        expect(mostRecentAjaxRequest.url).toBe("https://api.twitter.com/1/users/lookup.json");
        expect(mostRecentAjaxRequest.data).toEqual({user_id: user.twitterId()});
        expect(mostRecentAjaxRequest.dataType).toBe('jsonp');

        $.ajax.reset();

        // no redundant requests
        user.fetchTwitterAvatarUrl().success(function(url) {
          promise2Url = url;
        });
        expect($.ajax).not.toHaveBeenCalled();

        mostRecentAjaxRequest.success([{"profile_image_url_https":"https://si0.twimg.com/profile_images/1444927189/251213_556231630500_30901848_31623089_2614946_n_normal.jpg"}]);

        var expectedUrl = "https://si0.twimg.com/profile_images/1444927189/251213_556231630500_30901848_31623089_2614946_n_bigger.jpg"
        expect(promise1Url).toBe(expectedUrl);
        expect(promise2Url).toBe(expectedUrl);

        var promise3Url;
        user.fetchTwitterAvatarUrl().success(function(url) {
          promise3Url = url;
        });
        expect(promise3Url).toBe(expectedUrl);
      });
    });

  });

  describe("#gravatarUrl", function() {
    it("returns a gravatar url based on the given size and the user's email hash", function() {
      expect(user.gravatarUrl()).toEqual("https://secure.gravatar.com/avatar/fake-email-hash?s=40&d=404");
    });
  });
});
