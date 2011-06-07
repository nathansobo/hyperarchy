//= require spec/spec_helper

describe("LoginForm", function() {

  var loginForm, darkenedBackground;
  beforeEach(function() {
    $("#jasmine_content").html(window.Application = Views.Layout.toView());
    Application.attach();
    darkenedBackground = Application.darkenedBackground;
    loginForm = Application.loginForm;
    expect(loginForm).toExist();
  });

  describe("#afterShow", function() {
    it("shows the darkened background", function() {
      expect(loginForm).not.toBeVisible();
      loginForm.show();
      expect(loginForm).toBeVisible();
      expect(darkenedBackground).toBeVisible();
    });
  });

  describe("content", function() {
    it("contains a link to the signup form", function() {
      var signupFormLink = loginForm.find('a.signup-form-link');
      expect(signupFormLink).toExist();
      signupFormLink.click();
      var signupForm = Application.signupForm;
      expect(loginForm).toBeHidden();
      expect(signupForm).toBeVisible();
    });
  });
});
