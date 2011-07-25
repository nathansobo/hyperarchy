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
            a("Account Preferences");
          }).ref('accountLink')
            .click(function() {
              History.pushState(null, null, '/account');
            });
          li(function() {
            a("Connect With Twitter");
          }).ref('twitterConnectLink')
            .click('twitterConnect');
          li(function() {
            a("Connect With Facebook");
          }).ref('facebookConnectLink')
            .click('facebookConnect');
          li(function() {
            a("Logout")
          }).ref('logoutLink')
            .click('logout');
        }}
      });
    });
  }},

  viewProperties: {
    initialize: function() {
      this.dropdownMenu.logout = this.hitch('logout');
      this.dropdownMenu.twitterConnect = this.hitch('twitterConnect');
      this.dropdownMenu.facebookConnect = this.hitch('facebookConnect');
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

        this.registerInterest(user, 'onUpdate', this.showOrHideSocialConnectLinks);
        this.showOrHideSocialConnectLinks();
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
          Application.reload();
        }
      });
    },

    showOrHideSocialConnectLinks: function() {
      var user = Application.currentUser();

      if (user.twitterId()) {
        this.dropdownMenu.twitterConnectLink.hide();
      } else {
        this.dropdownMenu.twitterConnectLink.show();
      }
      if (user.facebookId()) {
        this.dropdownMenu.facebookConnectLink.hide();
      } else {
        this.dropdownMenu.facebookConnectLink.show();
      }
    },

    facebookConnect: function() {
      FB.login(this.bind(function(response) {
        if (response.session) {
          $.ajax({
            type: 'post',
            url: '/facebook_connections',
            dataType: 'records'
          });
        }
      }), {perms: "email"});
    },

    twitterConnect: function() {
      T.one('authComplete', this.bind(function(e, user) {
        $.ajax({
          type: 'post',
          url: '/twitter_connections',
          dataType: 'records'
        });
      }));

      T.signIn();
    }
  }
});

