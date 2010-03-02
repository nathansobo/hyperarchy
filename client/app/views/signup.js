constructor("Views.Signup", View.Template, {
  content: function() { with(this.builder) {
    div({id: 'signup'}, function() {
      ol(function() {
        li(function() {
          label({ 'for': 'full_name' }, "full name:");
          input({ type: 'text', id: 'full_name', name: 'full_name' });
        });
        li(function() {
          label({ 'for': 'email_address' }, "email address:");
          input({ type: 'text', id: 'email_address', name: 'email_address' });
        });
        li(function() {
          label({ 'for': 'password' }, "password:");
          input({ type: 'text', id: 'password', name: 'password', type: 'password' });
        });
      });
      button({id: 'signup_submit'}, "sign up").click(function(view) { view.signup_submitted(); });
    });
  }},

  view_properties: {
    signup_submitted: function() {
      Server.post('/users', this.field_values())
        .on_success(function(data) {
          Application.current_user_id_established(data.current_user_id);
          History.load('organization');
        });
    }
  }
});
