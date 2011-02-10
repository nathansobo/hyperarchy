_.constructor("Views.SignupPrompt", View.Template, {
  content: function() { with(this.builder) {
    div({id: "signupPrompt", 'class': "floatingCard dropShadow", style: "display: none;"}, function() {
      h1("Please sign up to vote:");
      form(function() {
        label("First Name");
        input({name: "firstName"}).ref('firstName');
        label("Last Name");
        input({name: "lastName"});
        label("Email Address");
        input({name: "emailAddress"});
        label("Choose Your Password");
        input({name: "password", type: "password"});

        input({type: "submit", value: "Sign Up", 'class': "glossyBlack roundedButton"});

        div({id: "logIn"}, function() {
          div("Already a member?");
          a("Click here to log in.");
        });
      }).submit('submitForm');
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
      this.future.triggerFailure();
    },

    submitForm: function() {
      Server.post("/signup", { user: _.underscoreKeys(this.fieldValues()) });
      return false;
    }
  }
});