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

  describe("loginFormLink", function() {
    it("shows the login form when clicked", function() {
      var loginForm = Application.loginForm;
      expect(loginForm).toBeHidden();
      signupForm.loginFormLink.click();
      expect(signupForm).toBeHidden();
      expect(loginForm).toBeVisible();
    });
  });

  describe("form submission", function() {
    describe("when the fields are valid and the form is submitted", function() {
      it("logs the user in according to the information entered", function() {
        var signupForm = Application.signupForm;
        signupForm.firstName.val("Richard");
        signupForm.lastName.val("Nixon");
        signupForm.emailAddress.val("dick@hell.de");
        signupForm.password.val("integrity");
        // signupForm.form.submit();
      });
    });

    describe("when the fields are invalid and the form is submitted", function() {
      it("displays an error message", function() {
        var signupForm = Application.signupForm;
        signupForm.firstName.val("Richard");
        signupForm.lastName.val("Nixon");
        signupForm.emailAddress.val("");
        // signupForm.form.submit();
      });
    });
});
