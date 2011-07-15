//= require spec/spec_helper

describe("Views.Lightboxes.SignupForm", function() {
  var signupForm, darkenedBackground;
  beforeEach(function() {
    renderLayout();
    darkenedBackground = Application.darkenedBackground;
    signupForm = Application.signupForm;
    expect(signupForm).toExist();
    signupForm.show();
  });

  describe("#afterShow / #afterHide", function() {
    it("shows / hides the darkened background, hides the organization section, and focuses the first field", function() {
      expect(signupForm).toBeVisible();
      expect(darkenedBackground).toBeVisible();
      signupForm.showOrganizationSection();

      signupForm.hide();

      expect(signupForm).not.toBeVisible();
      expect(darkenedBackground).not.toBeVisible();
      
      signupForm.show();

      expect(signupForm.errors).toBeHidden();
      expect(signupForm.organizationSection).toBeHidden();
      expect(darkenedBackground).toBeVisible();

      expect(Application.signupForm.firstName[0]).toBe(document.activeElement);
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
    beforeEach(function() {
      enableAjax();
    });

    describe("when the fields are valid and the form is submitted", function() {
      it("creates a user and logs them in according to the information entered and hides the form", function() {
        fetchInitialRepositoryContents();
        spyOn(Application, 'showPage');
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

    describe("when the organization section is visible and the organization name is specified", function() {
      it("signs them up and directs them to the main page of their new organization", function() {
        fetchInitialRepositoryContents();
        spyOn(Application, 'showPage');
        History.pushState(null, null, Organization.findSocial().url());

        var signupForm = Application.signupForm;
        signupForm.organizationSection.show();
        signupForm.firstName.val("Richard");
        signupForm.lastName.val("Nixon");
        signupForm.emailAddress.val("dick@hell.de");
        signupForm.organizationName.val("dick's group");
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
          expect(user.organizations().size()).toBe(2);

          var org = user.organizations().find({name: "dick's group"});
          expect(Path.routes.current).toEqual(org.url());
          expect(signupForm).toBeHidden();
          expect(Application.darkenedBackground).toBeHidden();
        });
      });
    });
  });

  describe("when the facebook login link is clicked", function() {
    var successTriggered, cancelTriggered;
    beforeEach(function() {
      signupForm.bind('success', function() {
        successTriggered = true;
      });
      signupForm.bind('cancel', function() {
        cancelTriggered = true;
      });
    });

    describe("when in 'normal' mode", function() {
      describe("when facebook login succeeds", function() {
        it("posts to the facebook_sessions controller and sets the current user based on the response", function() {
          spyOn(FB, 'login');
          signupForm.facebookLoginButton.click();
          expect(FB.login).toHaveBeenCalled();
          expect(FB.login.mostRecentCall.args[1]).toEqual({perms: "email"});
          var loginCallback = FB.login.mostRecentCall.args[0];
          loginCallback({ session: {uid: "123"} }); // simulate successful FB login

          expect($.ajax).toHaveBeenCalled();
          expect(mostRecentAjaxRequest.url).toBe('/facebook_sessions');
          expect(mostRecentAjaxRequest.type).toBe('post');

          var user = User.createFromRemote({id: 1});
          mostRecentAjaxRequest.success({current_user_id: user.id()});
          expect(Application.currentUser()).toBe(user);
          expect(successTriggered).toBeTruthy();
        });
      });
    });

    describe("when in 'add organization' mode", function() {
      beforeEach(function() {
        signupForm.showOrganizationSection();
      });

      describe("when facebook login succeeds", function() {
        it("shows the add organization form", function() {
          spyOn(FB, 'login');
          signupForm.facebookLoginButton.click();
          var loginCallback = FB.login.mostRecentCall.args[0];
          loginCallback({ session: { uid: "123"} }); // simulate successful FB login

          var user = User.createFromRemote({id: 1});
          mostRecentAjaxRequest.success({current_user_id: user.id()});

          expect(Application.addOrganizationForm).toBeVisible();
        });
      });
    });

    describe("when login fails", function() {
      it("hides the login form and triggers failure on the form", function() {
        spyOn(FB, 'login');
        signupForm.facebookLoginButton.click();
        expect(FB.login).toHaveBeenCalled();
        expect(FB.login.mostRecentCall.args[1]).toEqual({perms: "email"});
        var loginCallback = FB.login.mostRecentCall.args[0];
        loginCallback({ session: null }); // simulate unsuccessful FB login

        expect(signupForm).toBeHidden();
        expect(cancelTriggered).toBeTruthy();
      });
    });
  })
});
