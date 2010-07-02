_.constructor("Views.Layout", View.Template, {
  content: function() { with(this.builder) {

    div({id: "application"}, function() {
      div({id: "notification", style: "display: none"}).ref("notification");

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

            a({id: "organizationSelect", href: "#"}, "Organizations")
              .ref('organizationSelect')
              .click('toggleOrganizationSelect');

            ol({id: "organizationSelectList"}, function() {
              li(function() {
                a({href: "#view=addOrganization"}, "Add Organization...")
              }).ref('addOrganizationLi')
            }).ref('organizationSelectList');
          });
        });
      }).ref('body');
    })
  }},

  viewProperties: {
    initialize: function() {
      window.notify = this.hitch('notify');

      _.each(this.views, function(view) {
        view.hide();
        this.body.append(view);
      }, this);

      var memberships = Application.currentUser().memberships();

      memberships.onEach(function(membership) {
        this.addOrganizationLi.before(View.build(function(b) {
          var organization = membership.organization();
          b.li(function() {
            b.a({href: "#"}, organization.name()).click(function(view, e) {
              $.bbq.pushState({view: "organization", organizationId: organization.id()});
              e.preventDefault();
            });
          });
        }));
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
    },

    toggleOrganizationSelect: function(elt, e) {
      if (!this.organizationSelectList.is(":visible")) this.showOrganizationSelect();
      e.preventDefault();
    },

    showOrganizationSelect: function() {
      this.organizationSelectList.show().position({
        my: "left top",
        at: "left bottom",
        of: this.organizationSelect
      });

      this.defer(function() {
        $(window).one('click', this.hitch('hideOrganizationSelect'));
      });
    },

    hideOrganizationSelect: function() {
      this.organizationSelectList.hide();
    }
  }
});
