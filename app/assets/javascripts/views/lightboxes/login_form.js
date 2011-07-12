_.constructor('Views.Lightboxes.LoginForm', Views.Lightboxes.Lightbox, {
  id: "login-form",

  lightboxContent: function() { with(this.builder) {
    form(function() {
      h1("Log in to participate:");
      ul({'class': "errors"}).ref("errors");

      a("Sign in with Facebook").ref('facebookLoginButton').click("facebookLogin");
      label("Email Address");
      input({name: "user[emailAddress]", tabindex: 101}).ref('emailAddress');

      a({id: "forgot-password", href: "/password_reset_requests/new", 'class': "link"}, "I forgot my password");
      label("Password");
      input({name: "user[password]", type: "password", tabindex: 102}).ref('password');

      input({tabindex: 103, 'type': 'submit', 'class': "button", value: "Log in"}).ref('submit');

      div({'class': "signup-message"}, function() {
        div("Not yet a member?");
        a({'class': "link"}, "Click here to sign up.").ref("signupFormLink").click('showSignupForm');
      });
    }).ref('form').submit('submitForm');
  }},

  viewProperties: {
    showSignupForm: function() {
      Application.signupForm.show();
    },

    close: function($super) {
      $super();
      this.trigger('cancel');
    },

    beforeShow: function($super) {
      $super();
      this.errors.hide();
    },

    afterHide: function($super) {
      $super();
      this.emailAddress.val("")
      this.password.val("")
    },

    submitForm: function(e) {
      e.preventDefault();

      var promise = new Monarch.Promise();

      var fieldValues = _.underscoreKeys(this.fieldValues());
      $.ajax({
        type: 'post',
        url: "/login",
        data: fieldValues,
        dataType: 'data+records',
        success: this.hitch('userEstablished', promise),
        error: this.hitch('handleErrors', promise)
      });
      return promise;
    },

    facebookLogin: function() {
      var promise = new Monarch.Promise();

      FB.login(this.bind(function(response) {
        if (response.session) {
          $.ajax({
            type: 'post',
            url: '/facebook_sessions',
            dataType: 'data+records',
            success: this.hitch('userEstablished', promise)
          });
        } else {
          this.close();
        }
      }), {perms: "email"});

      return promise;
    },

    userEstablished: function(promise, data) {
      this.hide();
      Application.currentUserId(data.current_user_id).success(function() {
        this.trigger('success');
        promise.triggerSuccess();
      }, this);
    },
        
    handleErrors: function(promise, xhr) {
      var errors = this.getValidationErrors(xhr);
      this.errors.empty();
      this.errors.show();
      _.each(errors, function(error) {
        this.errors.append("<li>" + error + "</li>");
      }, this);
      promise.triggerError();
    }
  }
});

