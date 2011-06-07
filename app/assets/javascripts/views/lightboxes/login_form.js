_.constructor('Views.Lightboxes.LoginForm', Views.Lightbox, {
  id: "login-form",

  lightboxContent: function() { with(this.builder) {
    div(function() {
      h2("Log in");
      a({'class': "signup-form-link"}, "sign up").click("showSignupForm");
    });
  }},

  viewProperties: {
    showSignupForm: function() {
      Application.signupForm.show();
      this.hide();
    }
  }
});

