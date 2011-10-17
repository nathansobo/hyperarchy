//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

_.constructor('Views.Lightboxes.SignupForm', Views.Lightboxes.Lightbox, {
  id: "signup-form",

  lightboxContent: function() { with(this.builder) {
    subview('twitterLoginButton', Views.Components.SocialLoginButton, {service: 'twitter'});
    subview('facebookLoginButton', Views.Components.SocialLoginButton, {service: 'facebook'});

    h2("Or…").ref('participateHeader');

    form(function() {
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
    initialize: function() {
      this.twitterLoginButton.click(this.hitch('socialLogin', 'twitterLogin'));
      this.facebookLoginButton.click(this.hitch('socialLogin', 'facebookLogin'));
    },

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
        success: Application.hitch('currentUserEstablished', promise),
        error: this.hitch('handleError', promise)
      });
      return promise;
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

    socialLogin: function(loginMethod) {
      var addOrganization = this.organizationSection.is(':visible');
      Application[loginMethod]()
        .success(function() {
          this.trigger('success');
          this.hide();
          if (addOrganization) Application.addOrganizationForm.show();
        }, this);
    },

    showOrganizationSection: function() {
      this.organizationSection.show();
      this.addClass('add-organization');
      this.organizationName.focus();
    },

    hideOrganizationSection: function() {
      this.organizationSection.hide();
      this.removeClass('add-organization');
    },
    
    close: function($super) {
      $super();
      this.trigger('cancel');
    }
  }
});
