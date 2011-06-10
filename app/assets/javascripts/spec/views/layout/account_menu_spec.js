describe("Views.Layout.AccountMenu", function() {
  var accountMenu;
  beforeEach(function() {
    $("#jasmine_content").html(window.Application = Views.Layout.toView());
    Application.attach();
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

  describe("when the login link is clicked", function() {
    it("shows the login form", function() {
      accountMenu.loginLink.click();
      expect(Application.loginForm).toBeVisible();
    });
  });

  describe("when the logout link is clicked", function() {
    var user;

    beforeEach(function() {
      clearServerTables();
      user = login();
      expect(user.guest()).toBeFalsy();
    });

    it("it assigns the current to the default guest", function() {
      accountMenu.dropdownMenu.link.click();
      expect(accountMenu.dropdownMenu.logoutLink).toBeVisible();
      
      waitsFor("user to be logged out", function(complete) {
        accountMenu.dropdownMenu.logoutLink.trigger('click', complete);
        expect(User.find(user.id())).toBeDefined();
      });

      runs(function() {
        expect(User.find(user.id())).toBeUndefined();
        expect(Application.currentUser().guest()).toBeTruthy();
      });
    });
  });
});
