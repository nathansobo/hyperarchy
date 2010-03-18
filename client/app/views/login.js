constructor("Views.Login", View.Template, {
  content: function() { with(this.builder) {
    div({id: 'login'}, function() {
      div({id: 'errors', style: 'display:none'});
      div({id: 'loginForm'}, function() {
        label({ 'for': 'emailAddress' }, "email address:");
        input({ id: 'emailAddress', name: 'emailAddress' });
        label({ 'for': 'password' }, "password:");
        input({ id: 'password', name: 'password', type: 'password' });
        button({id: 'loginSubmit'}, "log in").click(function(view) { view.loginSubmitted(); });
      });
      a({id: "signUp", href: "#signup", local: true}, "sign up");
    });
  }},

  viewProperties: {
    loginSubmitted: function() {
      Server.post('/login', _.underscoreKeys(this.fieldValues()))
        .onSuccess(function(data) {
          Application.currentUserIdEstablished(data.current_user_id);
          History.load('organizations');
        })
        .onFailure(function(data) {
          this.find("#errors").html(Views.ErrorList.toView(data.errors)).show();
        }, this);
    }
  }
});
