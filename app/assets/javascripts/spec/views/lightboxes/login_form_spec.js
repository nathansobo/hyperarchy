//= require spec/spec_helper

describe("Views.Lightboxes.LoginForm", function() {
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
    
    it("causes the form to be hidden if the url changes", function() {
      loginForm.show();
      $(window).trigger('popstate');
      expect(loginForm).toBeHidden();
    });
    
    it("causes the form to be hidden if the darkened background is clicked", function() {
      loginForm.show();
      darkenedBackground.click();
      expect(loginForm).toBeHidden();
    });
  });

  describe("with the signupFormLink is clicked", function() {
    it("shows the signup form when clicked", function() {
      var signupForm = Application.signupForm;
      expect(signupForm).toBeHidden();
      loginForm.signupFormLink.click();
      expect(loginForm).toBeHidden();
      expect(signupForm).toBeVisible();
    });
  });

  describe("form submission", function() {
    var user;

    beforeEach(function() {
      enableAjax();
      usingBackdoor(function() {
        user = User.create();
        user.memberships().joinTo(Organization).fetch();
        History.pushState(null, null, user.defaultOrganization().url());
        Repository.clear();
      });
      loginForm.show();
    });

    describe("when the fields are valid and the form is submitted", function() {
      it("logs the user in according to the information entered and hides the form", function() {
        loginForm.emailAddress.val(user.emailAddress());
        loginForm.password.val("password");

        waitsFor("successful login", function(requestComplete) {
          loginForm.form.trigger('submit', requestComplete);
        });

        runs(function() {
          expect(Application.currentUser()).toEqual(user);
          expect(Path.routes.current).toEqual(user.defaultOrganization().url());
          expect(loginForm.emailAddress.val()).toEqual("");
          expect(loginForm.password.val()).toEqual("");
          expect(loginForm).toBeHidden();
          expect(darkenedBackground).toBeHidden();
        });
      });
    });

    describe("when the fields are invalid and the form is submitted", function() {
      it("displays an error message", function() {
        loginForm.emailAddress.val(user.emailAddress());
        loginForm.password.val("wrong password");

        waitsFor("errors from server", function(complete) {
          loginForm.form.trigger('submit', {error: complete});
        });

        runs(function() {
          expect(loginForm.errors.text()).toContain("password");
          expect(loginForm).toBeVisible();
        });
      });
    });
  });
});

