_.constructor('Views.Lightboxes.SignupForm', Views.Lightbox, {
  id: "signup-form",

  lightboxContent: function() { with(this.builder) {
    form(function() {
      h1("Sign up to participate:");
      div().ref("errors");

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

    submitForm: function(e) {
      e.preventDefault();
      var fieldValues = _.underscoreKeys(this.fieldValues());
      return $.ajax({
        type: 'post',
        url: "/signup",
        data: fieldValues,
        dataType: 'data+records',
        success: this.hitch('handleSuccess'),
        error: this.hitch('handleError')
      });
    },

    handleSuccess: function(data) {
      Application.currentUserId(data.current_user_id);
      this.hide();
    },

    handleError: function(xhr) {
      var errors = this.getValidationErrors(xhr);
      this.errors.empty();
      _.each(errors, function(error) {
        this.errors.append(error);
      }, this);
    }
  }
});
