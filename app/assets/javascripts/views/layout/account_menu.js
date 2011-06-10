_.constructor('Views.Layout.AccountMenu', View.Template, {
  content: function() { with(this.builder) {
    div({'class': "dropdown-menu"}, function() {
      a({id: "login-link"}, "Login").ref('loginLink').click("showLoginForm");
      a({id: "dropdown-link"}, function() {
        img({id: "avatar"}).ref("avatar");
        span({id: "name"}).ref("name");
      }).ref('dropdownLink').click("showDropdown");

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
      Application.signal('currentUser').change(function(user) {
        if (user.guest()) {
          this.loginLink.show();
          this.dropdownLink.hide();
        } else {
          this.avatar.attr('src', user.gravatarUrl(25));
          this.name.html(user.fullName());
          this.loginLink.hide();
          this.dropdownLink.show();
        }
      }, this);
    },

    showLoginForm: function() {
      Application.loginForm.show();
    },

    showDropdown: function() {
      if (this.dropdown.is(':visible')) return;

      this.dropdown.show();
      this.defer(function() {
        $(window).one('click', this.hitch('hideDropdown'));
      });
    },

    hideDropdown: function() {
      this.dropdown.hide();
    },

    logout: function(e) {
      e.preventDefault();
      return $.ajax({
        type: 'post',
        url: "/logout",
        dataType: 'data+records!',
        success: function(data) {
          Application.currentUserId(data.current_user_id);
        }
      });
    }
  }
});

