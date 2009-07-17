constructor("Views.Login", View.Template, {
  content: function() { with(this.builder) {
    div({id: 'login_view'}, function() {
      label({ 'for': 'email_address' }, "Email address:");
      input({ id: 'email_address', name: 'email_address' });
      label({ 'for': 'password' }, "Password:");
      input({ id: 'password', name: 'password' });
      a({id: "sign_up", href: "#signup"}, "Sign Up").click(function() {
        Application.navigate('signup');
      });
    });
  }}
});