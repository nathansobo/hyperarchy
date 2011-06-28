_.constructor('Views.Lightboxes.SignupForm', Views.Lightboxes.Lightbox, {
  id: "signup-form",

  lightboxContent: function() { with(this.builder) {
    form(function() {
      h1("Sign up to participate:").ref('participateHeader');
      h1("Add your organization:").ref('addOrganizationHeader');
      ul({'class': "errors"}).ref("errors");

      div(function() {
        label("Organization Name");
        input({name: "organization[name]"}).ref('organizationName');
      }).ref("organizationSection");
      label("First Name");
      input({name: "user[first_name]"}).ref('firstName');
      label("Last Name");
      input({name: "user[last_name]"}).ref('lastName');
      label("Email Address");
      input({name: "user[email_address]"}).ref('emailAddress');
      label("Choose Your Password");
      input({name: "user[password]", type: "password"}).ref('password');
      input({'class': "button", type: "submit", value: "Sign up"});

      div({'class': "login-message"}, function() {
        div("Already a member?");
        a({'class': "link"}, "Click here to log in.").ref("loginFormLink").click('showLoginForm');
      });
    }).ref('form').submit('submitForm');
  }},

  viewProperties: {
    showLoginForm: function() {
      Application.loginForm.show();
    },

    afterShow: function($super) {
      this.errors.hide();
      this.hideOrganizationSection();
      $super();
    },

    submitForm: function(e) {
      e.preventDefault();
      var promise = new Monarch.Promise();
      var fieldValues = _.underscoreKeys(this.fieldValues());
      $.ajax({
        type: 'post',
        url: "/signup",
        data: fieldValues,
        dataType: 'data+records',
        success: this.hitch('handleSuccess', promise),
        error: this.hitch('handleError', promise)
      });
      return promise;
    },

    handleSuccess: function(promise, data) {
      this.hide();
      Application.currentUserId(data.current_user_id).success(function() {
        this.trigger('success');
        promise.triggerSuccess();
      }, this);
      var newOrganizationId = data.new_organization_id;
      if (newOrganizationId) History.pushState(null, null, Organization.find(newOrganizationId).url());
    },

    handleError: function(promise, xhr) {
      var errors = this.getValidationErrors(xhr);
      this.errors.empty();
      this.errors.show();
      _.each(errors, function(error) {
        this.errors.append("<li>" + error + "</li>");
      }, this);
      promise.triggerError();
    },

    showOrganizationSection: function() {
      this.organizationSection.show();
      this.addOrganizationHeader.show();
      this.participateHeader.hide();
      this.addClass('add-organization');
      this.organizationName.focus();
    },

    hideOrganizationSection: function() {
      this.organizationSection.hide();
      this.addOrganizationHeader.hide();
      this.participateHeader.show();
      this.removeClass('add-organization');
    },
    
    close: function($super) {
      this.trigger('cancel');
      $super();
    }
  }
});
