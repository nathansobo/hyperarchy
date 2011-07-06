_.constructor('Views.Pages.Account', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: 'account'}, function() {
      div({id: "personal-details"}, function() {
        h2("Personal Details");
        label("First Name");
        input({name: "user[first_name]"}).ref('firstName');
        label("Last Name");
        input({name: "user[last_name]"}).ref('lastName');
        label("Email Address");
        input({name: "user[email_address]"}).ref('emailAddress');

        input({type: "submit", value: "Save", 'class': "update button"});
      });

      div({id: "password-reset"}, function() {
        h2("Reset Your Password");
        label({'for': "old_password"}, "Old Password");
        input({name: "old_password", type: "password"}).ref('oldPassword');
        label("New Password");
        input({name: "password", type: "password"}).ref('password');
        label("Confirm New Password");
        input({name: "password_confirmation", type: "password"}).ref('passwordConfirmation');

        input({type: "submit", value: "Change Password", 'class': "update button"});
      });

      div({id: "email-preferences"}, function() {
        h2("Email Preferences");
        input({type: "checkbox", name: "email_enabled"});
        label({'for': "email_enabled"}, "I want to receive email (global setting)");
      });
    });
  }},

  viewProperties: {
    propertyAccessors: ['params']
  }
});
