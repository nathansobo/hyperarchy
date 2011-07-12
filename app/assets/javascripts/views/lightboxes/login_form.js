_.constructor('Views.Lightboxes.LoginForm', Views.Lightboxes.Lightbox, {
  id: "login-form",

  lightboxContent: function() { with(this.builder) {
    a({'class': "facebook button"}, function() {
      div({'class': "fb-logo"});
      text("Sign In With Facebook");
    }).ref('facebookLoginButton').click(function() {
      Application.facebookLogin();
    });

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

