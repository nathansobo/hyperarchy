_.constructor("Views.Layout", View.Template, {
  content: function() { with(this.builder) {
    div({id: "layout"}, function() {
      div({id: "header-wrapper"}, function() {
        div({id: "header"}, function() {
          h1("HYPERARCHY");
          div({id: "menu-items"}, function() {
            subview('organizationsMenu', Views.Layout.OrganizationsMenu);
            subview('accountMenu', Views.Layout.AccountMenu);
          });
        });
      });

      div({id: "body-wrapper"}, function() {
        div({id: "body"}, function() {
          subview('organizationPage', Views.Pages.Organization);
          subview('electionPage', Views.Pages.Election);
        }).ref("body");
      });

      div({id: "lightboxes"}, function() {
        subview("loginForm", Views.Lightboxes.LoginForm);
        subview("signupForm", Views.Lightboxes.SignupForm);
      }).ref("lightboxes");

      div({id: "darkened-background"}).ref("darkenedBackground");
    });
  }},

  viewProperties: {
    currentUser: {
      change: function(user) {
        this.currentUserId(user.id());
      }
    },

    currentUserId: {
      change: function(id) {
        this.currentUser(User.find(id));
      }
    },

    showPage: function(name, params) {
      this.body.children().hide();
      var parsedParams = {};
      _.each(params, function(value, key) {
        parsedParams[key] = parseInt(value);
      })
      this[name + 'Page'].show().params(parsedParams);
    }
  }
});
