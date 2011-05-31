_.constructor("Views.SignupPrompt", View.Template, {
  content: function() { with(this.builder) {
    div({id: "signupPrompt", 'class': "floatingCard dropShadow", style: "display: none;"}, function() {
      div({'class': "cancelX"}).click('hide');

      div({'class': "errors", style: "display: none;"}).ref('errorsDiv');

      form(function() {
        h1("Sign up to participate:").ref('signupHeadline');

        div({style: "display: none;"}, function() {
          label("Organization Name");
          input({name: "organization[name]"}).ref('organizationName');
        }).ref("organizationNameRow");
        label("First Name");
        input({name: "user[first_name]"}).ref('firstName');
        label("Last Name");
        input({name: "user[last_name]"});
        label("Email Address");
        input({name: "user[email_address]"});
        label("Choose Your Password");
        input({name: "user[password]", type: "password"});

        input({type: "submit", value: "Sign Up", 'class': "glossyBlack roundedButton"});

        div({id: "login"}, function() {
          div("Already a member?");
          a("Click here to log in.", {href: '#'}).click('showLoginForm');
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
          a("Click here to sign up.", {href: '#', tabindex: 105}).click('showSignupForm');
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
      this.prepareForm();
      this.position({
        my: "center",
        at: "center",
        of: Application.layout.darkenBackground
      });
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

    showSignupForm: function(view, e) {
      if (e) e.preventDefault();
      this.retainOrganizationName = false;
      this.signupHeadline.html("Sign up to participate:")
      this.errorsDiv.hide();
      this.signupForm.show();
      this.loginForm.hide();
      this.organizationNameRow.hide();
      this.prepareForm();
    },

    includeOrganization: function() {
      this.retainOrganizationName = true;
      this.signupHeadline.html("Sign up to add your organization:")
      this.organizationNameRow.show();
      this.prepareForm();
    },

    showLoginForm: function(view, e) {
      if (e) e.preventDefault();
      this.errorsDiv.hide();
      this.signupForm.hide();
      this.loginForm.show();
      this.prepareForm();
    },

    prepareForm: function() {
      this.find('input[type="text"]').val("")
      this.find("input:visible:first").focus();
    },

    submitSignupForm: function() {
      this.errorsDiv.hide();
      var fieldValues = _.underscoreKeys(this.signupForm.fieldValues());
      if (!this.retainOrganizationName) delete fieldValues['organization[name]'];
      $.ajax({
        type: 'post',
        url: "/signup",
        data: fieldValues,
        dataType: 'data+records',
        success: this.hitch('userEstablished'),
        error: this.hitch('handleErrors')
      });

      return false;
    },

    submitLoginForm: function() {
      this.errorsDiv.hide();
      $.ajax({
        type: 'post',
        url: "/login",
        data: { user: _.underscoreKeys(this.loginForm.fieldValues()) },
        dataType: 'data+records',
        success: this.hitch('userEstablished'),
        error: this.hitch('handleErrors')
      });
      return false;
    },

    userEstablished: function(data) {
      Application.currentUserIdEstablished(data.current_user_id)
      if (this.future) {
        this.future.triggerSuccess(data);
        delete this.future;
      }
      this.hide();
    },

    handleErrors: function(data) {
      var errors = JSON.parse(data.responseText).errors
      this.errorsDiv.html(errors.join("<br/>"));
      this.errorsDiv.show();
    }
  }
});