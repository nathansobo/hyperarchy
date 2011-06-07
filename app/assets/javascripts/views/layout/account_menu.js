_.constructor('Views.Layout.AccountMenu', View.Template, {
  content: function() { with(this.builder) {
    div({id: "account-menu", 'class': "menu"}, function() {
      a({id: "login-link"}, "Login").ref('loginLink').click("showLoginForm");
      div({id: "user-link"}, function() {
        img({id: "avatar"}).ref("avatar");
        span({id: "name"}).ref("name");
      }).ref('userLink').click("showDropdown");

      ul({'class': "dropdown"}, function() {
        li(function() {
          a("Logout").
            ref("logoutLink").
            click("logout");
        });
        li(function() {
          a("Account Preferences").
            ref("logoutLink").
            click("logout");
        });
      }).ref("dropdown");
    });
  }},

  viewProperties: {
    attach: function() {
      Application.currentUser.change(function(user) {
        if (user.guest()) {
          this.loginLink.show();
        } else {
          this.avatar.attr('src', user.gravatarUrl(25));
          this.name.html(user.fullName());
          this.userLink.show();
        }
      }, this);
    },

    showLoginForm: function() {
      Application.loginForm.show();
    },

    showDropdown: function() {
      this.dropdown.show();
      this.defer(function() {
        $(window).one('click', this.hitch('hideDropdown'));
      });
    },

    hideDropdown: function() {
      this.dropdown.hide();
    }
  }
});

