_.constructor("Views.Layout", View.Template, {
  content: function() { with(this.builder) {
    div({id: "layout"}, function() {

      div({id: "header"}, function() {
        div({id: "header-content"}, function() {
          h1("HYPERARCHY");
          div({id: "menu-items"}, function() {
            subview('organizationsMenu', Views.Layout.OrganizationsMenu);
            subview('accountMenu', Views.Layout.AccountMenu);
          });
        });
      });

      div({id: "body"});

      div({id: "lightboxes"}, function() {
        subview("loginForm", Views.Lightboxes.LoginForm);
        subview("signupForm", Views.Lightboxes.SignupForm);
      }).ref("lightboxes");

      div({id: "darkened-background"}).ref("darkenedBackground");
    });
  }},

  viewProperties: {
    initialize: function() {
      Path.listen();
    },
    
    currentUser: {
      change: function(user) {
        this.currentUserId(user.id());
      }
    },

    currentUserId: {
      change: function(id) {
        this.currentUser(User.find(id));
      }
    }
  }
});
