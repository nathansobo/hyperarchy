_.constructor("Views.SignupPrompt", View.Template, {
  content: function() { with(this.builder) {
    div({id: "signupPrompt", 'class': "floatingCard dropShadow", style: "display: none;"}, function() {
      div({'class': "cancelX"}).click('hide');

      div({'class': "errors", style: "display: none;"}).ref('errorsDiv');
      
      form(function() {
        h1("Sign up to participate:");


        label("First Name");
        input({name: "firstName"}).ref('firstName');
        label("Last Name");
        input({name: "lastName"});
        label("Email Address");
        input({name: "emailAddress"});
        label("Choose Your Password");
        input({name: "password", type: "password"});

        input({type: "submit", value: "Sign Up", 'class': "glossyBlack roundedButton"});

        div({id: "login"}, function() {
          div("Already a member?");
          a("Click here to log in.", {href: '#'}).click('toggleForms');
        });
      }).ref('signupForm')
        .submit('submitSignupForm');

      form({style: "display: none;"}, function() {
        h1("Log in to participate:");

        label("Email Address");
        input({name: "emailAddress", tabindex: 101});

        a({id: "forgotPassword", href: "/request_password_reset", tabindex: 104 }, "forgot my password")
        label("Password");
        input({name: "password", type: "password", tabindex: 102});

        input({type: "submit", value: "Log In", 'class': "glossyBlack roundedButton", tabindex: 103});
        div({id: "signup"}, function() {
          div("Not yet a member?");
          a("Click here to sign up.", {href: '#', tabindex: 105}).click('toggleForms');
        });
      }).ref('loginForm')
        .submit('submitLoginForm');
    });
  }},

  viewProperties: {
    beforeShow: function() {
      Application.layout.darkenBackground.fadeIn();
      Application.layout.darkenBackground.one('click', this.hitch('hide'));
    },

    afterShow: function() {
      this.position({
        my: "center",
        at: "center",
        of: Application.layout.darkenBackground
      });
      this.firstName.focus();
    },

    afterHide: function() {
      Application.layout.darkenBackground.hide();
      this.errorsDiv.hide();
      this.signupForm.show();
      this.loginForm.hide();
      this.find('input[type="text"]').val("")
      if (this.future) {
        this.future.triggerFailure();
        delete this.future;
      } 
    },

    toggleForms: function() {
      this.errorsDiv.hide();
      this.signupForm.toggle();
      this.loginForm.toggle();
      this.find('input[type="text"]').val("")
      this.find("input:visible:first").focus();
      return false;
    },

    showLoginForm: function() {
      this.errorsDiv.hide();
      this.signupForm.hide();
      this.loginForm.show();
      this.find('input[type="text"]').val("")
      this.find("input:visible:first").focus();
    },

    submitSignupForm: function() {
      this.errorsDiv.hide();
      Server.post("/signup", { user: _.underscoreKeys(this.signupForm.fieldValues()) })
        .onSuccess(this.hitch('userEstablished'))
        .onFailure(this.hitch('handleErrors'));

      return false;
    },

    submitLoginForm: function() {
      this.errorsDiv.hide();
      Server.post("/login", _.underscoreKeys(this.loginForm.fieldValues()))
        .onSuccess(this.hitch('userEstablished'))
        .onFailure(this.hitch('handleErrors'));
      return false;
    },

    userEstablished: function(data) {
      Application.currentUserIdEstablished(data.current_user_id)
      if (this.future) {
        this.future.triggerSuccess();
        delete this.future;
      }
      this.hide();
    },

    handleErrors: function(data) {
      this.errorsDiv.html(data.errors.join("<br/>"));
      this.errorsDiv.show();
    }
  }
});