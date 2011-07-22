_.constructor("Views.Components.SocialLoginButton", View.Template, {
  content: function(params) { with(this.builder) {
    a({'class': "disabled button " + params.service}, function() {
      div({'class': "logo"});
      subview("spinner", Views.Components.Spinner);
      span().ref("buttonText");
    });
  }},

  viewProperties: {
    initialize: function() {
      this.buttonText.text("Loading " + this.serviceDisplayName());
      this.spinner.show();
    },

    attach: function($super) {
      $super();
      Application[this.service + "Initialized"](this.hitch('enable'));
    },

    enable: function() {
      this.spinner.hide();
      this.buttonText.text("Sign In With " + this.serviceDisplayName());
      this.removeClass('disabled');
    },

    serviceDisplayName: function() {
      return _.capitalize(this.service);
    }
  }
});