//= require spec/spec_helper

describe("SignupForm", function() {

  var signupForm, darkenedBackground;
  beforeEach(function() {
    $("#jasmine_content").html(window.Application = Views.Layout.toView());
    Application.attach();
    darkenedBackground = Application.darkenedBackground;
    signupForm = Application.signupForm;
    expect(signupForm).toExist();
  });

  describe("#afterShow", function() {
    it("shows the darkened background", function() {
      expect(signupForm).not.toBeVisible();
      signupForm.show();
      expect(signupForm).toBeVisible();
      expect(darkenedBackground).toBeVisible();
    });
  });

  describe("content", function() {
    it("contains a link to the login form", function() {
      var loginFormLink = signupForm.find('a.login-form-link');
      expect(loginFormLink).toExist();
      loginFormLink.click();
      var loginForm = Application.loginForm;
      expect(signupForm).toBeHidden();
      expect(loginForm).toBeVisible();
    });
  });
});
