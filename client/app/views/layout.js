_.constructor("Views.Layout", View.Template, {
  content: function() { with(this.builder) {
    div({id: "application"}, function() {
      div({id: "notification", style: "display: none"}).ref("notification");
      div({id: "darkenBackground", style: "display: none"})
        .ref('darkenBackground');

      subview('disconnectDialog', Views.DisconnectDialog);

      div({id: "feedback", style: "display: none", 'class': "dropShadow"}, function() {
        div({'class': "rightCancelX"}).click('hideFeedbackForm');
        div({id: "thanks", 'class': "largeFont"}, function() {
          text("Thanks for taking the time to talk to us! Feel free to get in touch with us via email at ");
          a({href: "mailto:admin@hyperarchy.com"}, "admin@hyperarchy.com");
          text(".")
        });
        textarea().ref("feedbackTextarea");
        a({'class': "glossyBlack roundedButton", href: "#"}, "Send Feedback").click('sendFeedback');
      }).ref("feedbackForm");

      ol({'class': "dropdownMenu"}, function() {
        li(function() {
          a({href: "#view=account"}, "Preferences");
        });
        li(function() {
          a({href: "#"}, "Log Out").click(function() {
            $("<form action='/logout' method='post'>").appendTo($("body")).submit();
            return false;
          });
        });
      }).ref('accountMenu');

      ol({'class': "dropdownMenu"}, function() {
        li(function() {
          a({href: "#view=addOrganization"}, "Add Organization...")
        }).ref('addOrganizationLi')
      }).ref('organizationsMenu');





      div({id: "header"}, function() {
        div({id: "logoWrapper", 'class': "headerItemX"}, function() {
          div({id: "logo"}).click('goToLastOrganization');
        });

        a({'class': "headerItem dropdownLink", href: "#"}, "Account")
          .ref('accountMenuLink')
          .click("toggleAccountMenu");

        a({id: "switchOrganizations", 'class': "headerItem dropdownLink"}, "Organizations")
          .ref("organizationsMenuLink")
          .click("toggleOrganizationsMenu");

        a({'class': "headerItem", href: "#"}, "Feedback").click('showFeedbackForm');
        div({'class': "clear"});
      });

      subview("welcomeGuide", Views.WelcomeGuide);

      div({id: "mainContent"}, function() {

        div({id: "contentHeader"}, function() {
          div(function() {
            h2({id: "organizationName"})
              .ref('organizationName')
              .click('goToOrganization');
            a({id: "questionsLink"}, "Questions")
              .ref('questionsLink')
              .click('goToQuestions');
            a({id: "membersLink"}, "Members")
              .ref('membersLink')
              .click("goToMembers");
            a({id: "organizationSettings"}, "Settings")
              .ref("editOrganizationLink")
              .click("goToEditOrganization");

            a({id: "raise", 'class': "rightSide"}, "Raise Question")
              .click("goToNewElection");

          }).ref("organizationHeader");

          div(function() {
            h2().ref("alternateHeaderText");

            a({id: "backToLastOrganization", 'class': "rightSide"})
              .ref("backToLastOrganizationLink")
              .click("goToLastOrganization");
          }).ref("alternateHeader");
        });

        div({id: "subheader"}).ref("subheader");

        div({'class': "container12"}, function() {
        }).ref('body');
      }).ref('mainContentArea');
    })
  }},

  viewProperties: {
    initialize: function() {
      window.notify = this.hitch('notify');

      this.mainContentArea.fillVerticalSpace(30, 380, 'min-height');
      $(window).resize(this.bind(function() {
        this.mainContentArea.fillVerticalSpace(30, 380, 'min-height');
      }));

      this.subheaders = {};
      _.each(this.views, function(view, viewName) {
        var subheaderContent = view.subheaderContent;
        if (subheaderContent) {
          subheaderContent.detach();
          subheaderContent.hide();
          this.subheaders[viewName] = subheaderContent;
          this.subheader.append(subheaderContent);
        }

        view.hide();
        this.body.append(view);
      }, this);

      this.populateOrganizations();
    },

    organization: {
      afterChange: function(organization) {
        this.organizationName.bindHtml(organization, 'name');
        if (organization.currentUserCanEdit()) {
          this.editOrganizationLink.show();
        } else {
          this.editOrganizationLink.hide();
        }
      }
    },

    showOrganizationHeader: function() {
      this.alternateHeader.hide();
      this.organizationHeader.show();
    },

    showAlternateHeader: function(text) {
      var lastOrgName = Application.currentUser().lastVisitedOrganization().name();
      this.backToLastOrganizationLink.html("Back to " + lastOrgName);
      this.alternateHeaderText.html(text);
      this.organizationHeader.hide();
      this.alternateHeader.show();
    },

    populateOrganizations: function() {
      var organizations =
        Application.currentUser().admin() ?
          Organization.orderBy('name')
          : Application.currentUser().confirmedMemberships().joinThrough(Organization).orderBy('name');

      organizations.onEach(this.hitch('populateOrganization'));

      Organization.onRemoteUpdate(function(organization, changes) {
        if (!changes.name) return;
        var name = organization.name();
        var selector = 'a[organizationId=' + organization.id() + ']';
        this.organizationsMenu.find(selector).html(name);
      }, this);
    },

    populateOrganization: function(organization, addToAdminMenu) {
      this.addOrganizationLi.before(View.build(function(b) {
        b.li(function() {
          b.a({href: "#", organizationId: organization.id()}, organization.name()).click(function(view, e) {
            $.bbq.pushState({view: "organization", organizationId: organization.id()});
            e.preventDefault();
          });
        });
      }));
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

    toggleAccountMenu: function(elt, e) {
      e.preventDefault();
      this.toggleMenu(this.accountMenuLink, this.accountMenu);
    },

    toggleMenu: function(link, menu) {
      if (menu.is(":visible")) return;

      menu.show();
      menu.position({
        my: "left top",
        at: "left bottom",
        of: link,
        collision: "none"
      });


      _.defer(function() {
        $(window).one('click', function() {
          menu.hide();
        });
      });
    },

    showFeedbackForm: function(elt, e) {
      this.darkenBackground.fadeIn();
      this.darkenBackground.one('click', this.hitch('hideFeedbackForm'));

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
      return false;
    },

    goToOrganization: function() {
      $.bbq.pushState({view: "organization", organizationId: this.organization().id() }, 2);
      return false;
    },

    goToQuestions: function() {
      $.bbq.pushState({view: "organization", organizationId: this.organization().id() }, 2);
     return false;
    },

    goToEditOrganization: function() {
      $.bbq.pushState({view: "editOrganization", organizationId: this.organization().id() }, 2);
      return false;
    },

    goToMembers: function() {
      $.bbq.pushState({view: "members", organizationId: this.organization().id() }, 2);
      return false;
    },

    goToNewElection: function() {
      $.bbq.pushState({view: "newElection", organizationId: this.organization().id() }, 2);
      return false;
    },

    goToLastOrganization: function() {
      var organizationId = Application.currentUser().lastVisitedOrganization().id();
      $.bbq.pushState({view: "organization", organizationId: organizationId }, 2);
    },

    deactivateAllTabs: function() {
      $(this.questionsLink).removeClass('active');
      $(this.membersLink).removeClass('active');
      $(this.editOrganizationLink).removeClass('active');
    },

    showSubheaderContent: function(viewName) {
      _.each(this.subheaders, function(element) {element.hide();});
      if (viewName in this.subheaders) {
        this.subheader.css('height', "28px")
        this.subheaders[viewName].show();
      } else {
//        this.subheader.hide();
        this.subheader.css('height', "8px");
      }
    },

    activateHeaderTab: function(link) {
      this.deactivateAllTabs();
      $(this[link]).addClass('active');
    }
  }
});
