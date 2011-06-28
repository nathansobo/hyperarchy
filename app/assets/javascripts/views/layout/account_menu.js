_.constructor('Views.Layout.AccountMenu', View.Template, {
  content: function() { with(this.builder) {
    div({'id': "account-menu"}, function() {
      a({id: "login-link"}, "Login").ref('loginLink').click("showLoginForm");
      subview('dropdownMenu', Views.Layout.DropdownMenu, {
        linkContent: function() { with(this.builder) {
          subview('avatar', Views.Components.Avatar, {imageSize: 27});
          div({id: "name"}).ref("name");
        }},
        menuContent: function() { with(this.builder) {
          li(function() {
            a("Logout").
              ref("logoutLink").
              click('logout');
          });
          li(function() {
            a("Account Preferences")
          });
        }}
      });
    });
  }},

  viewProperties: {
    initialize: function() {
      this.dropdownMenu.logout = this.hitch('logout');
    },

    attach: function() {
      Application.onCurrentUserChange(this.hitch('handleCurrentUserChange'));
    },

    handleCurrentUserChange: function() {
      var user = Application.currentUser();
      if (user.guest()) {
        this.loginLink.show();
        this.dropdownMenu.hide();
      } else {
        this.dropdownMenu.avatar.user(user);
        this.dropdownMenu.name.html(user.fullName());
        this.loginLink.hide();
        this.dropdownMenu.show();
      }
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

