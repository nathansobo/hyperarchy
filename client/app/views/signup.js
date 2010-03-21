_.constructor("Views.Signup", View.Template, {
  content: function() { with(this.builder) {
    div({id: 'signup'}, function() {
      ol(function() {
        li(function() {
          label({ 'for': 'fullName' }, "full name:");
          input({ type: 'text', id: 'fullName', name: 'fullName' });
        });
        li(function() {
          label({ 'for': 'emailAddress' }, "email address:");
          input({ type: 'text', id: 'emailAddress', name: 'emailAddress' });
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
    signupSubmitted: function() {
      Server.post('/users', this.fieldValues())
        .onSuccess(function(data) {
          Application.currentUserIdEstablished(data.currentUserId);
          History.load('organizations');
        });
    }
  }
});
