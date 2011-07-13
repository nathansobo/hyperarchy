//= require spec/spec_helper

describe("Views.Lightboxes.LoginForm", function() {
  var loginForm, darkenedBackground;
  beforeEach(function() {
    renderLayout();
    darkenedBackground = Application.darkenedBackground;
    loginForm = Application.loginForm;
    expect(loginForm).toExist();
  });

  describe("#afterShow", function() {
    it("shows the darkened background, hides the errors, and focuses the email address", function() {
      expect(loginForm).not.toBeVisible();
      loginForm.show();
      expect(loginForm).toBeVisible();
      expect(darkenedBackground).toBeVisible();
      expect(loginForm.errors).toBeHidden();
      expect(loginForm.emailAddress[0]).toBe(document.activeElement);
    });
    
    it("causes the form to be hidden if the url changes", function() {
      loginForm.show();
      spyOn(Application.organizationPage, 'params');
      History.pushState(null, null, 'organizations/1');
      expect(loginForm).toBeHidden();
    });
    
    it("hides tho form if the darkened background is clicked", function() {
      loginForm.show();
      darkenedBackground.click();
      expect(loginForm).toBeHidden();
      expect(darkenedBackground).toBeHidden();
    });

    it("hides the form if the 'x' is clicked", function() {
      loginForm.show();
      loginForm.closeX.click();
      expect(loginForm).toBeHidden();
      expect(darkenedBackground).toBeHidden();
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
          expect(loginForm.errors).toBeVisible();
          expect(loginForm.errors.text()).toContain("password");
          expect(loginForm).toBeVisible();
        });
      });
    });
  });

  describe("when the facebook login link is clicked", function() {
    var successTriggered, cancelTriggered;
    beforeEach(function() {
      loginForm.bind('success', function() {
        successTriggered = true;
      });
      loginForm.bind('cancel', function() {
        cancelTriggered = true;
      });
    });

    describe("when facebook login succeeds", function() {
      it("posts to the facebook_sessions controller and sets the current user based on the response", function() {
        spyOn(FB, 'login');
        loginForm.facebookLoginButton.click();
        expect(FB.login).toHaveBeenCalled();
        expect(FB.login.mostRecentCall.args[1]).toEqual({perms: "email,publish_stream"});
        var loginCallback = FB.login.mostRecentCall.args[0];
        loginCallback({ session: { uid: '123'} }); // simulate successful FB login

        expect($.ajax).toHaveBeenCalled();
        expect(mostRecentAjaxRequest.url).toBe('/facebook_sessions');
        expect(mostRecentAjaxRequest.type).toBe('post');

        var user = User.createFromRemote({id: 1});
        mostRecentAjaxRequest.success({current_user_id: user.id()});
        expect(Application.currentUser()).toBe(user);
        expect(successTriggered).toBeTruthy();
      });
    });

    describe("when login fails", function() {
      it("hides the login form and triggers failure on the form", function() {
        spyOn(FB, 'login');
        loginForm.facebookLoginButton.click();
        expect(FB.login).toHaveBeenCalled();
        expect(FB.login.mostRecentCall.args[1]).toEqual({perms: "email,publish_stream"});
        var loginCallback = FB.login.mostRecentCall.args[0];
        loginCallback({ session: null }); // simulate unsuccessful FB login

        expect(loginForm).toBeHidden();
        expect(cancelTriggered).toBeTruthy();
      });
    });
  });
});

