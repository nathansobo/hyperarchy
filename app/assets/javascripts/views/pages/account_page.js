_.constructor('Views.Pages.Account', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: 'account'}, function() {
      form({id: "personal-details"}, function() {
        h2("Personal Details");
        label("First Name");
        input({name: "firstName"}).ref('firstName');
        label("Last Name");
        input({name: "lastName"}).ref('lastName');
        label("Email Address");
        input({name: "emailAddress"}).ref('emailAddress');

        input({type: "submit", value: "Save", 'class': "update button"}).ref('updateButton');
      }).ref('personalDetails').submit('update');

//      div({id: "password-reset"}, function() {
//        h2("Reset Your Password");
//        label({'for': "old_password"}, "Old Password");
//        input({name: "old_password", type: "password"}).ref('oldPassword');
//        label("New Password");
//        input({name: "password", type: "password"}).ref('password');
//        label("Confirm New Password");
//        input({name: "password_confirmation", type: "password"}).ref('passwordConfirmation');
//
//        input({type: "submit", value: "Change Password", 'class': "update button"});
//      });

      div({id: "email-preferences"}, function() {
        h2("Email Preferences");
        input({type: "checkbox", name: "emailEnabled"}).ref('emailEnabled').change('updateEmailEnabled');
        label({'for': "emailEnabled"}, "I want to receive email (global setting)");
      });
    });
  }},

  viewProperties: {
    params: {
      change: function(params) {
        this.user(User.find(params.userId));
      }
    },

    user: {
      change: function(user) {
        this.model(user);
        this.enableOrDisableUpdateButton();
        this.personalDetails.find('input').bind('keyup paste cut change', this.hitch('enableOrDisableUpdateButton'));
      }
    },

    enableOrDisableUpdateButton: function() {
      var canSave = !this.fieldValuesMatchModel() && this.noDetailsEmpty();
      this.updateButton.attr('disabled', !canSave);
    },

    noDetailsEmpty: function() {
      return _.all([this.firstName, this.lastName, this.emailAddress], function(field) {
        return $.trim(field.val()) !== "";
      });
    },

    update: function() {
      this.user().update(this.personalDetails.fieldValues());
      return false;
    },

    updateEmailEnabled: function() {
      this.user().update({emailEnabled: this.emailEnabled.attr('checked')});
    }
  }
});
