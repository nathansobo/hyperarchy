//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

describe("Views.Layout.AccountMenu", function() {
  var accountMenu;
  beforeEach(function() {
    renderLayout();
    Application.currentUser(User.createFromRemote({id: 1}));
    accountMenu = Application.accountMenu;
    expect(accountMenu).toExist();
  });

  describe("showing and hiding of the login link and the avatar / name / dropdown link", function() {
    var guest, member;

    beforeEach(function() {
      guest = User.createFromRemote({id: 1, guest: true, firstName: "Guest", lastName: "User"});
      member = User.createFromRemote({id: 2, guest: false, firstName: "Joe", lastName: "Member", emailHash: 'fake-email-hash'});
    });

    it("shows the login link when the current user is a guest and the avatar / name / dropdown link otherwise", function() {
      Application.currentUser(guest);

      expect(accountMenu.dropdownMenu).toBeHidden();
      expect(accountMenu.loginLink).toBeVisible();

      Application.currentUser(member);

      expect(accountMenu.loginLink).toBeHidden();
      expect(accountMenu.dropdownMenu).toBeVisible();
      expect(accountMenu.dropdownMenu.avatar.user()).toEqual(member);
      expect(accountMenu.dropdownMenu.name.html()).toEqual(member.fullName());

      Application.currentUser(guest);

      expect(accountMenu.dropdownMenu).toBeHidden();
      expect(accountMenu.loginLink).toBeVisible();
    });
  });

  describe("showing and hiding of the facebook and twitter connect links", function() {
    it("shows the twitter and facebook connect links only for users who do not have twitter or facebook ids, respectively", function() {
      var twitterUser = User.createFromRemote({id: 1, firstName: "Jackie", lastName: "D", twitter_id: 2345, facebook_id: null});
      var facebookUser = User.createFromRemote({id: 2, firstName: "Marky", lastName: "Z", facebook_id: '2345', twitter_id: null});
      var antiSocialUser = User.createFromRemote({id: 3, firstName: "Billy", lastName: "G", facebook_id: null, twitter_id: null});

      Application.currentUser(twitterUser);
      expect(accountMenu.dropdownMenu).toBeVisible();

      accountMenu.dropdownMenu.link.click();
      expect(accountMenu.dropdownMenu.menu).toBeVisible();
      expect(accountMenu.dropdownMenu.twitterConnectLink).toBeHidden();
      expect(accountMenu.dropdownMenu.facebookConnectLink).toBeVisible();

      Application.currentUser(antiSocialUser);
      expect(accountMenu.dropdownMenu.twitterConnectLink).toBeVisible();
      expect(accountMenu.dropdownMenu.facebookConnectLink).toBeVisible();

      antiSocialUser.remotelyUpdated({twitterId: 4355});
      expect(accountMenu.dropdownMenu.twitterConnectLink).toBeHidden();
      expect(accountMenu.dropdownMenu.facebookConnectLink).toBeVisible();

      antiSocialUser.remotelyUpdated({twitterId: 0}); // twitter id got jacked by another user record
      expect(accountMenu.dropdownMenu.twitterConnectLink).toBeVisible();
      expect(accountMenu.dropdownMenu.facebookConnectLink).toBeVisible();

      antiSocialUser.remotelyUpdated({facebookId: 4355});
      expect(accountMenu.dropdownMenu.twitterConnectLink).toBeVisible();
      expect(accountMenu.dropdownMenu.facebookConnectLink).toBeHidden();

      antiSocialUser.remotelyUpdated({facebookId: 0}); // facebook id got jacked by another user record
      expect(accountMenu.dropdownMenu.twitterConnectLink).toBeVisible();
      expect(accountMenu.dropdownMenu.facebookConnectLink).toBeVisible();

      Application.currentUser(facebookUser);
      expect(accountMenu.dropdownMenu.twitterConnectLink).toBeVisible();
      expect(accountMenu.dropdownMenu.facebookConnectLink).toBeHidden();

      Application.currentUser(twitterUser);
      expect(accountMenu.dropdownMenu.twitterConnectLink).toBeHidden();
      expect(accountMenu.dropdownMenu.facebookConnectLink).toBeVisible();
    });
  });

  describe("when the twitter connect link is clicked", function() {
    var userWithoutTwitterId;

    beforeEach(function() {
      spyOn(T, 'signIn');
      userWithoutTwitterId = User.createFromRemote({id: 2, firstName: "Sad", lastName: "Facebookuser", twitter_id: null});
      Application.currentUser(userWithoutTwitterId);
      accountMenu.dropdownMenu.link.click();
      accountMenu.dropdownMenu.twitterConnectLink.click();

      expect(T.signIn).toHaveBeenCalled();
    });

    describe("when the user successfully logs into twitter", function() {
      it("posts to /twitter_connects", function() {
        var twitterId = 123;
        T.trigger('authComplete', {}, { id: twitterId, name: "Max Brunsfeld" });

        expect($.ajax).toHaveBeenCalled();
        expect(mostRecentAjaxRequest.url).toBe('/twitter_connections');

        // response records should be user, with new twitterId value
      });
    });
  });

  describe("when the facebook connect link is clicked", function() {
    var userWithoutFacebookId;

    beforeEach(function() {
      spyOn(FB, 'login');
      userWithoutFacebookId = User.createFromRemote({id: 2, firstName: "Serious", lastName: "Professional", facebook_id: null});
      Application.currentUser(userWithoutFacebookId);
      accountMenu.dropdownMenu.link.click();
      accountMenu.dropdownMenu.facebookConnectLink.click();

      expect(FB.login).toHaveBeenCalled();
    });

    describe("when the user successfully logs into facebook", function() {
      it("posts to /facebook_connects", function() {
        var facebookId = 123;
        var loginCallback = FB.login.mostRecentCall.args[0];
        loginCallback({session: { uid: '123' }});

        expect($.ajax).toHaveBeenCalled();
        expect(mostRecentAjaxRequest.url).toBe('/facebook_connections');

        // response records should be user, with new facebookId value
      });
    });
  });

  describe("when the login link is clicked", function() {
    it("shows the login form", function() {
      accountMenu.loginLink.click();
      expect(Application.loginForm).toBeVisible();
    });
  });

  describe("when the logout link is clicked", function() {
    it("it logs out and reloads the page", function() {
      accountMenu.dropdownMenu.link.click();
      expect(accountMenu.dropdownMenu.logoutLink).toBeVisible();

      spyOn(Application, 'reload');
      accountMenu.dropdownMenu.logoutLink.click();

      expect(mostRecentAjaxRequest.url).toBe('/logout');
      simulateAjaxSuccess();

      expect(Application.reload).toHaveBeenCalled();
    });
  });

  describe("when the account preferences link is clicked", function() {
    it("navigates to the account page", function() {
      spyOn(Application, 'showPage');
      accountMenu.dropdownMenu.accountLink.click();
      expect(Path.routes.current).toBe('/account');
    });
  });
});
