_.constructor("Views.Layout", View.Template, {
  content: function() { with(this.builder) {

    div({id: "application"}, function() {
      div({id: "notification", style: "display: none"}, "Thank you. Your invitations have been sent.").ref("notification");

      div({'class': "container12"}, function() {
        div({id: "header", 'class': "grid12"}, function() {
          div({'class': "grid3 alpha"}, function() {
            div({id: "logo"});
          });

          div({'class': "grid9 omega"}, function() {
            a({'class': "logout", href: "#"}, "Log Out").click(function() {

              $("<form action='/logout' method='post'>").appendTo($("body")).submit();
            });
            a({'class': "invite", href: "#view=invite"}, "Invite");
            a({'class': "addOrganization", href: "#view=addOrganization"}, "Add Your Organization");
          });
        });
      }).ref('body');;
    })
  }},

  viewProperties: {
    initialize: function() {
      window.notify = this.hitch('notify');

      _.each(this.views, function(view) {
        view.hide();
        this.body.append(view);
      }, this);
    },

    notify: function(message) {
      this.notification.html(message);
      this.notification.slideDown('fast');
      _.delay(_.bind(function() {
        this.notification.slideUp('fast');
        this.notification.empty();
      }, this), 3000);
    },

    switchViews: function(selectedView) {
      _.each(this.views, function(view) {
        if (view === selectedView) {
          view.show();
        } else {
          view.hide();
        }
      });
    }
  }
});
