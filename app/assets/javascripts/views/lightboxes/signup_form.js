_.constructor('Views.Lightboxes.SignupForm', Views.Lightbox, {
  id: "signup-form",

  lightboxContent: function() { with(this.builder) {
    form(function() {
      h1("Sign up to participate:");

      label("First Name");
      input({name: "user[first_name]"}).ref('firstName');
      label("Last Name");
      input({name: "user[last_name]"}).ref('lastName');
      label("Email Address");
      input({name: "user[email_address]"}).ref('emailAddress');
      label("Choose Your Password");
      input({name: "user[password]", type: "password"}).ref('password');
      input({type: "submit", value: "Sign Up"}).ref('submit');

      div("Already a member?");
      a("Click here to log in.").ref("loginFormLink").click('showLoginForm');
    }).ref('form').submit('submitForm');
  }},

  viewProperties: {
    showLoginForm: function() {
      Application.loginForm.show();
    },

    submitForm: function() {
      
    }
  }
});
