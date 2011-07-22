_.constructor('Views.Lightboxes.LoginForm', Views.Lightboxes.Lightbox, {
  id: "login-form",

  lightboxContent: function() { with(this.builder) {
    subview('twitterLoginButton', Views.Components.SocialLoginButton, {service: 'twitter'});
    subview('facebookLoginButton', Views.Components.SocialLoginButton, {service: 'facebook'});

    h2("Or…");
    form(function() {
      ul({'class': "errors"}).ref("errors");

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
    initialize: function() {
      this.twitterLoginButton.click(this.hitch('socialLogin', 'twitterLogin'));
      this.facebookLoginButton.click(this.hitch('socialLogin', 'facebookLogin'));
    },

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
        success: Application.hitch('currentUserEstablished', promise),
        error: this.hitch('handleErrors', promise)
      });
      return promise;
    },

    socialLogin: function(loginMethod) {
      Application[loginMethod]()
        .success(function() {
          this.trigger('success');
          this.hide();
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

