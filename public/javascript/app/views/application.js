constructor("Views.Application", View.Template, {
  content: function() { with(this.builder) {
    div({id: 'application_view'}, function() {
      h1("Hyperarchy");
      subview('login_view', Views.Login);
      subview('signup_view', Views.Signup);
    });
  }}
});