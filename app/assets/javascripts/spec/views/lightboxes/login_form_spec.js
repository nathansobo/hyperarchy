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
    describe("when the fields are valid and the form is submitted", function() {
      var user;

      it("logs the user in according to the information entered", function() {
        clearServerTables();
        
        usingBackdoor(function() {
          var promise = User.create();

          debugger;

            promise.onSuccess(function(newUser) {
              debugger;
              console.log("assigning user");
              user = newUser;
            });
        });


        var loginForm = Application.loginForm;
        loginForm.emailAddress.val("foo");
        loginForm.password.val("password");
        // signupForm.form.submit();
      });
    });

    describe("when the fields are invalid and the form is submitted", function() {
      it("displays an error message", function() {
        loginForm.emailAddress.val("dick@hell.de");
        loginForm.password.val("garbage");
        // signupForm.form.submit();
      });
    });
  });
});

