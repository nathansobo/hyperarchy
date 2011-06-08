_.constructor('Views.Lightboxes.LoginForm', Views.Lightbox, {
  id: "login-form",

  lightboxContent: function() { with(this.builder) {
    form(function() {
      h1("Log in to participate:");

      label("Email Address");
      input({name: "user[emailAddress]", tabindex: 101}).ref('emailAddress');

      label("Password");
      input({name: "user[password]", type: "password", tabindex: 102}).ref('password');

      input({type: "submit", value: "Log In", tabindex: 103}).ref('submit');

      div("Not yet a member?");
      a("Click here to sign up.").ref("signupFormLink").click('showSignupForm');
    }).ref('form').submit('submitForm');
  }},

  viewProperties: {
    showSignupForm: function() {
      Application.signupForm.show();
    },

    submitForm: function(e) {
      e.preventDefault();
      var fieldValues = _.underscoreKeys(this.fieldValues());
      return $.ajax({
        type: 'post',
        url: "/login",
        data: fieldValues,
        dataType: 'data+records'
//        success: this.hitch('userEstablished'),
//        error: this.hitch('handleErrors')
      });
    }
  }
});

