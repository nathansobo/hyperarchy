describe("Views.Layout.AccountMenu", function() {

  var accountMenu;
  beforeEach(function() {
    $("#jasmine_content").html(window.Application = Views.Layout.toView());
    Application.attach();
    accountMenu = Application.accountMenu;
    expect(accountMenu).toExist();
  });

  describe("when the current user is assigned as a guest", function() {
    it("shows the login link", function() {
      expect(accountMenu.loginLink).toBeHidden();
      Application.currentUser(User.createFromRemote({id: 1, guest: true}));
      expect(accountMenu.userLink).toBeHidden();
      expect(accountMenu.loginLink).toBeVisible();
    });

    describe("when the login link is clicked", function() {
      it("shows the the login form", function() {
        var user = User.createFromRemote({id: 1, guest: true})
        Application.currentUser(user);
        accountMenu.loginLink.click();
        expect(Application.loginForm).toBeVisible();
      });
    });
  });

  describe("when the current user is not a guest", function() {
    it("shows the current user's name and avatar", function() {
      var user = User.createFromRemote({id: 1, guest: false, firstName: "Joe", lastName: "Blo"});

      expect(accountMenu.userLink).toBeHidden();
      Application.currentUser(user);
      expect(accountMenu.loginLink).toBeHidden();
      expect(accountMenu.userLink).toBeVisible();
      expect(accountMenu.avatar.attr('src')).toEqual(user.gravatarUrl(25));
      expect(accountMenu.name.html()).toEqual(user.fullName());
    });

    describe("when the link is clicked", function() {
      it("shows the the dropdown account menu", function() {
        var user = User.createFromRemote({id: 1, guest: false})
        Application.currentUser(user);
        accountMenu.userLink.click();
        expect(accountMenu.dropdown).toBeVisible();
      });
    });
  });
});
