constructor("Views.Login", View.Template, {
  content: function() { with(this.builder) {
    div({id: 'login_view'}, function() {
      div({id: 'errors', style: 'display:none'});
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
      var self = this;
      Server.post('/login', this.field_values())
        .on_success(function(data) {
          Application.current_user_id_established(data.current_user_id);
          History.load('elections');
        })
        .on_failure(function(data) {
          self.find("#errors").html(Views.ErrorList.to_view(data.errors)).show();
        });
    }
  }
});
