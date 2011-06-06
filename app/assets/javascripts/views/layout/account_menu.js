_.constructor('Views.Layout.AccountMenu', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "account-menu"}, function() {
      a({id: "login-link"}, "Login").ref('loginLink');
      div({id: "user-info"}, function() {
        img({id: "avatar"}).ref("avatar");
        span({id: "name"}).ref("name");
      }).ref('userInfo');
    });
  }},

  viewProperties: {

    propertyAccessor: ['foo'],

    attach: function() {
      Application.currentUser.change(function(user) {
        if (user.guest()) {
          this.loginLink.show();
        } else {
          this.avatar.attr('src', user.gravatarUrl(25));
          this.name.html(user.fullName());
          this.userInfo.show();
        }
      }, this);
    }
  }
});