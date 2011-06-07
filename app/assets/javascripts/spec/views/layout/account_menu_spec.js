//= require spec/spec_helper

describe("Views.Layout.AccountMenu", function() {

  var view;
  beforeEach(function() {
    $("#jasmine_content").html(window.Application = Views.Layout.toView());
    Application.attach();
    view = Application.accountMenu;
    expect(view).toExist();
  });

  describe("when the current user is assigned as a guest", function() {
    it("shows the login link", function() {
      expect(view.loginLink).toBeHidden();
      Application.currentUser(User.createFromRemote({id: 1, guest: true}));
      expect(view.userInfo).toBeHidden();
      expect(view.loginLink).toBeVisible();
    });
  });

  describe("when the current user is not a guest", function() {
    it("shows the current user's name and avatar", function() {
      var user = User.createFromRemote({id: 1, guest: false, firstName: "Joe", lastName: "Blo"});

      expect(view.userInfo).toBeHidden();
      Application.currentUser(user);
      expect(view.loginLink).toBeHidden();
      expect(view.userInfo).toBeVisible();
      expect(view.avatar.attr('src')).toEqual(user.gravatarUrl(25));
      expect(view.name.html()).toEqual(user.fullName());
    });
  });

  describe("when the login link is clicked", function() {
    it("shows the the login form", function() {
      var user = User.createFromRemote({id: 1, guest: true})
      Application.currentUser(user);
      view.loginLink.click();
      expect(Application.loginForm).toBeVisible();
    });
  });
});
