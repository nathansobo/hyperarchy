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

      div({id: "email-preferences"}, function() {
        h2("Email Preferences");
        input({type: "checkbox", name: "emailEnabled"}).ref('emailEnabled').change('updateEmailEnabled');
        label({'for': "emailEnabled"}, "I want to receive email (global setting)");

        subview('membershipPreferences', Views.Components.SortedList, {
          buildElement: function(membership) {
            return Views.Pages.Account.MembershipPreferencesLi.toView({membership: membership});
          }
        });
      });
    });
  }},

  viewProperties: {
    beforeShow: function() {
      Application.addClass('normal-height');
    },

    afterHide: function() {
      Application.removeClass('normal-height');
    },

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
        this.membershipPreferences.relation(user.memberships());
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
