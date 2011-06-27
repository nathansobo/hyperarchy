_.constructor('Views.Lightboxes.LoginForm', Views.Lightboxes.Lightbox, {
  id: "login-form",

  lightboxContent: function() { with(this.builder) {
    form(function() {
      h1("Log in to participate:");
      ul({'class': "errors"}).ref("errors");

      label("Email Address");
      input({name: "user[emailAddress]", tabindex: 101}).ref('emailAddress');

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

    beforeShow: function($super) {
      $super();
      this.errors.hide();
      $(window).one('popstate', this.hitch('hide'));
    },

    afterHide: function($super) {
      $super();
      this.emailAddress.val("")
      this.password.val("")
    },

    submitForm: function(e) {
      e.preventDefault();
      var fieldValues = _.underscoreKeys(this.fieldValues());
      return $.ajax({
        type: 'post',
        url: "/login",
        data: fieldValues,
        dataType: 'data+records',
        success: this.hitch('userEstablished'),
        error: this.hitch('handleErrors')
      });
    },

    userEstablished: function(data) {
      Application.currentUserId(data.current_user_id);
      History.pushState(null, null, Application.currentUser().defaultOrganization().url());
      this.hide();
    },
        
    handleErrors: function(xhr) {
      var errors = this.getValidationErrors(xhr);
      this.errors.empty();
      this.errors.show();
      _.each(errors, function(error) {

        this.errors.append("<li>" + error + "</li>");
      }, this);
    }
  }
});

