constructor("Views.Login", View.Template, {
  content: function() { with(this.builder) {
    div({id: 'login_view'}, function() {
      label({ 'for': 'email_address' }, "Email address:");
      input({ id: 'email_address', name: 'email_address' });
      label({ 'for': 'password' }, "Password:");
      input({ id: 'password', name: 'password', type: 'password' });
      button({id: 'login_submit'}, "Log In").click(function(view) {
        Application.post('/login', view.field_values())
          .on_success(function(data) {
            Application.current_user_id = data.current_user_id;
            jQuery.history.load('elections');
          });
      });
      a({id: "sign_up", href: "#signup", local: true}, "Sign Up");
    });
  }}
});