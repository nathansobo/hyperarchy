constructor("Views.Application", View.Template, {
  content: function() { with(this.builder) {
    div({id: 'application_view'}, function() {
      h1("Hyperarchy");
      subview('elections_view', Views.Elections);
      subview('login_view', Views.Login);
      subview('signup_view', Views.Signup);
    });
  }},

  view_properties: {
    initialize: function() {
      this.elections_view.hide();
      this.signup_view.hide();
      window.Application = this;
    },

    navigate: function(path) {
      switch(path) {
        case "signup":
          this.elections_view.hide();
          this.login_view.hide();
          this.signup_view.show();
          break;
      }
    }
  }
});