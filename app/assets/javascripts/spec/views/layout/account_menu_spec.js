//= require spec/spec_helper

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
