_.constructor('Views.Lightboxes.SignupForm', Views.Lightbox, {
  id: "signup-form",

  lightboxContent: function() { with(this.builder) {
    div(function() {
      h2("Sign up");
      a({'class': "login-form-link"}, "log in").click("showLoginForm");
    });
  }},

  viewProperties: {
    showLoginForm: function() {
      Application.loginForm.show();
      this.hide();
    }
  }
});
