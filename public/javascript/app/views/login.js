constructor("Views.Login", View.Template, {
  content: function() { with(this.builder) {
    div({id: 'login_view'}, function() {

      div({id: 'login_form'}, function() {
        label({ 'for': 'email_address' }, "email address:");
        input({ id: 'email_address', name: 'email_address' });
        label({ 'for': 'password' }, "password:");
        input({ id: 'password', name: 'password', type: 'password' });
        button({id: 'login_submit'}, "log in").click(function(view) { view.login_submitted(); });
      });
      a({id: "sign_up", href: "#signup", local: true}, "sign up");
    });
  }},

  view_properties: {
    login_submitted: function() {
      Application.post('/login', this.field_values())
        .on_success(function(data) {
          Application.current_user_id = data.current_user_id;
          jQuery.history.load('elections');
        });
    }
  }
});