constructor("Views.Signup", View.Template, {
  content: function() { with(this.builder) {
    div({id: 'signup_view'}, function() {
      label({ 'for': 'full_name' }, "Full name:");
      input({ type: 'text', id: 'full_name', name: 'full_name' });
      label({ 'for': 'email_address' }, "Email address:");
      input({ type: 'text', id: 'email_address', name: 'email_address' });
      label({ 'for': 'password' }, "Password:");
      input({ type: 'text', id: 'password', name: 'password', type: 'password' });

      button({id: 'signup_submit'}, "Sign Up").click(function(view) {
        Application.post('/users', view.field_values())
          .on_success(function(data) {
            Application.current_user_id = data.current_user_id;
            jQuery.history.load('elections');
          });
      });
    });
  }}
});
