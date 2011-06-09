//= require spec/spec_helper

describe("SignupForm", function() {

  var signupForm, darkenedBackground;
  beforeEach(function() {
    $("#jasmine_content").html(window.Application = Views.Layout.toView());
    Application.attach();
    darkenedBackground = Application.darkenedBackground;
    signupForm = Application.signupForm;
    expect(signupForm).toExist();
    signupForm.show();
  });

  describe("#afterShow / #afterHide", function() {
    it("shows / hides the darkened background", function() {
      expect(signupForm).toBeVisible();
      expect(darkenedBackground).toBeVisible();

      signupForm.hide();

      expect(signupForm).not.toBeVisible();
      expect(darkenedBackground).not.toBeVisible();
      
      signupForm.show();

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
      it("creates a user and logs them in according to the information entered and hides the form", function() {
        clearServerTables();
        fetchInitialRepositoryContents();
        History.pushState(null, null, Organization.findSocial().url());

        var signupForm = Application.signupForm;
        signupForm.firstName.val("Richard");
        signupForm.lastName.val("Nixon");
        signupForm.emailAddress.val("dick@hell.de");
        signupForm.password.val("integrity");


        waitsFor("successful signup", function(complete) {
          signupForm.form.trigger('submit', complete);
        });

        runs(function() {
          var user = Application.currentUser();
          expect(user.guest()).toBeFalsy();
          expect(user.firstName()).toEqual("Richard");
          expect(user.lastName()).toEqual("Nixon");
          expect(user.emailAddress()).toEqual("dick@hell.de");
          expect(user.organizations().size()).toBe(1);
          expect(user.organizations().first().social()).toBeTruthy();
          expect(Path.routes.current).toEqual(Organization.findSocial().url());
          expect(signupForm).toBeHidden();
          expect(Application.darkenedBackground).toBeHidden();
        });
      });
    });

    describe("when the fields are invalid and the form is submitted", function() {
      it("displays an error message", function() {
        var signupForm = Application.signupForm;

        signupForm.firstName.val("Richard");
        signupForm.lastName.val("Nixon");
        signupForm.emailAddress.val("");

        waitsFor("invalid signup", function(complete) {
          signupForm.form.trigger('submit', {error: complete});
        });

        runs(function() {
          expect(signupForm.errors).toBeVisible();
          expect(signupForm.errors.text()).toContain("email address");
          expect(signupForm).toBeVisible();
        });
      });
    });
  });
});
