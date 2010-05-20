_.constructor("Views.Signup", View.Template, {
  content: function() { with(this.builder) {
    div({id: 'signup'}, function() {
      ol(function() {
        li(function() {
          label({ 'for': 'fullName' }, "full name:");
          input({ type: 'text', id: 'fullName', name: 'user[full_name' });
        });
        li(function() {
          label({ 'for': 'emailAddress' }, "email address:");
          input({ type: 'text', id: 'emailAddress', name: 'email_address' });
        });
        li(function() {
          label({ 'for': 'password' }, "password:");
          input({ type: 'text', id: 'password', name: 'password', type: 'password' });
        });
      });
      button({id: 'signupSubmit'}, "sign up").click(function(view) { view.signupSubmitted(); });
    });
  }},

  viewProperties: {
    viewName: 'signup',

    signupSubmitted: function() {
      Server.post('/signup', this.fieldValues())
        .onSuccess(function(data) {
          Application.currentUserIdEstablished(data.current_user_id);
          jQuery.bbq.pushState({view: 'organization'});
        });
    }
  }
});
