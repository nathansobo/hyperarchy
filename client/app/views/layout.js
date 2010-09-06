_.constructor("Views.Layout", View.Template, {
  content: function() { with(this.builder) {

    div({id: "application"}, function() {
      div({id: "notification", style: "display: none"}).ref("notification");
      div({id: "darkenBackground", style: "display: none"})
        .click('hideFeedbackForm')
        .ref('darkenBackground');
      div({id: "feedback", style: "display: none"}, function() {
        div({id: "x"}).click('hideFeedbackForm');
        div({id: "thanks", 'class': "largeFont"}, function() {
          text("Thanks for taking the time to talk to us! Feel free to get in touch with us via email at ");
          a({href: "mailto:admin@hyperarchy.com"}, "admin@hyperarchy.com");
          text(".")
        });
        textarea().ref("feedbackTextarea");
        input({type: "submit", 'class': "largeFont", value: "Send Feedback"}).click('sendFeedback');
      }).ref("feedbackForm");

      div({'class': "container12"}, function() {
        div({id: "header", 'class': "grid12"}, function() {
          div({'class': "grid3 alpha"}, function() {
            div({id: "logo"});
          });

          div({'class': "grid9 omega"}, function() {
            a({'class': "logout headerItem", href: "#"}, "Log Out").click(function() {
              $("<form action='/logout' method='post'>").appendTo($("body")).submit();
            });
            a({'class': "feedback headerItem", href: "#"}, "Feedback").click('showFeedbackForm');
            a({'class': "invite headerItem", href: "#view=invite"}, "Invite");

            a({'class': "headerItem dropdownLink", href: "#"}, "Admin")
              .ref('adminMenuLink')
              .click('toggleAdminMenu');

            ol({'class': "dropdownMenu"}, function() {
            }).ref('adminMenu');

            a({'class': "headerItem dropdownLink", href: "#"}, "Organizations")
              .ref('organizationsMenuLink')
              .click('toggleOrganizationsMenu');

            ol({'class': "dropdownMenu"}, function() {
              li(function() {
                a({href: "#view=addOrganization"}, "Add Organization...")
              }).ref('addOrganizationLi')
            }).ref('organizationsMenu');
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

      var memberships = Application.currentUser().confirmedMemberships();

      if (memberships.where({role: "owner"}).empty()) this.adminMenuLink.hide();

      memberships.onEach(function(membership) {
        var organization = membership.organization();

        this.addOrganizationLi.before(View.build(function(b) {
          b.li(function() {
            b.a({href: "#"}, organization.name()).click(function(view, e) {
              $.bbq.pushState({view: "organization", organizationId: organization.id()});
              e.preventDefault();
            });
          });
        }));

        if (membership.role() == "owner") {
          this.adminMenuLink.show();
          this.adminMenu.append(View.build(function(b) {
            b.li(function() {
              b.a({href: "#"}, organization.name() + " Admin").click(function(view, e) {
                $.bbq.pushState({view: "editOrganization", organizationId: organization.id()});
                e.preventDefault();
              });
            });
          }))
        }
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

    toggleOrganizationsMenu: function(elt, e) {
      e.preventDefault();
      this.toggleMenu(this.organizationsMenuLink, this.organizationsMenu);
    },

    toggleAdminMenu: function(elt, e) {
      e.preventDefault();
      this.toggleMenu(this.adminMenuLink, this.adminMenu);
    },

    toggleMenu: function(link, menu) {
      if (menu.is(":visible")) return;

      menu.show().position({
        my: "left top",
        at: "left bottom",
        of: link
      });

      _.defer(function() {
        $(window).one('click', function() {
          menu.hide();
        });
      });
    },

    showFeedbackForm: function(elt, e) {
      this.darkenBackground.show();

      this.feedbackForm
        .show()
        .position({
          my: "center",
          at: "center",
          of: this.darkenBackground
        });

      e.preventDefault();
    },

    hideFeedbackForm: function(elt, e) {
      this.darkenBackground.hide();
      this.feedbackForm.hide();
    },

    sendFeedback: function() {
      Server.post("/feedback", {
        feedback: this.feedbackTextarea.val()
      }).onSuccess(function() {
        this.hideFeedbackForm();
        this.notify("Thanks for the feedback!")
      }, this);
    }
  }
});
