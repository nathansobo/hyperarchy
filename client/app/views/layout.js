_.constructor("Views.Layout", View.Template, {
  content: function() { with(this.builder) {
    div({id: "application"}, function() {

      div({id: "notification", style: "display: none"}).ref("notification");
      div({id: "darkenBackground", style: "display: none"})
        .ref('darkenBackground');
      subview('disconnectDialog', Views.DisconnectDialog);
      subview('inviteForm', Views.Invite);
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
          a({href: "#"}, "Log Out").click(function(elt, e) {
            e.preventDefault();
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


      div({id: "globalHeader"}, function() {
        div({id: "logoWrapper"}, function() {
          div({id: "logo"}).click('goToLastOrganization');
        });
        a({'class': "globalHeaderItem dropdownLink", href: "#"}, "Account")
          .ref('accountMenuLink')
          .click("toggleAccountMenu");
        a({'class': "globalHeaderItem dropdownLink"}, "Organizations")
          .ref("organizationsMenuLink")
          .click("toggleOrganizationsMenu");
        a({'class': "globalHeaderItem", href: "#"}, "Invite")
          .ref('inviteLink')
          .click('showInviteForm');
        a({'class': "globalHeaderItem", href: "#"}, "Feedback")
          .click('showFeedbackForm');

        div({'class': "clear"});
      });

      subview("welcomeGuide", Views.WelcomeGuide);

      div({id: "mainContent"}, function() {

        div({id: "navigationBar"}, function() {
          div(function() {
            h2({id: "organizationName"})
              .ref('organizationName')
              .click('goToOrganization');
            a({id: "questionsLink"}, "View Questions")
              .ref('questionsLink')
              .click('goToQuestions');
            a({id: "raise"}, "Raise a Question")
              .ref("newElectionLink")
              .click("goToNewElection");
            a({id: "membersLink"}, "Members")
              .ref('membersLink')
              .click("goToMembers");
            a({id: "organizationSettings"}, "Settings")
              .ref("editOrganizationLink")
              .click("goToEditOrganization");
          }).ref("organizationNavigationBar");

          div(function() {
            h2().ref("alternateNavigationBarText");
            a({id: "backToLastOrganization", 'class': "rightSide"})
              .ref("backToLastOrganizationLink")
              .click("goToLastOrganization");
          }).ref("alternateNavigationBar");
        });

        div({id: "subNavigationBar"}).ref("subNavigationBar");

        div({'id': "scrollingArea"}, function() {
          div({'class': "container12"}, function() {
          }).ref('body');
        }).ref('scrollingArea');
      }).ref('mainContentArea');
    })
  }},

  viewProperties: {
    initialize: function() {
      window.notify = this.hitch('notify');

      this.defer(this.hitch('adjustHeight'));
      $(window).resize(this.hitch('adjustHeight'));
      
      this.subNavigationContents = {};
      _.each(this.views, function(view, viewName) {
        if (view.subNavigationContent) {
          view.subNavigationContent.hide();
          this.subNavigationContents[viewName] = view.subNavigationContent.detach();
          this.subNavigationBar.append(this.subNavigationContents[viewName]);
        }
        view.hide();
        this.body.append(view);
      }, this);
      this.hideSubNavigationContent();

      this.populateOrganizations();
      var organizationsPermitted = Application.currentUser().organizationsPermittedToInvite();
      organizationsPermitted.onInsert(this.hitch('showOrHideInviteLink'));
      organizationsPermitted.onRemove(this.hitch('showOrHideInviteLink'));
      this.showOrHideInviteLink();
    },

    adjustHeight: function() {
      this.scrollingArea.fillVerticalSpace(60, 380);
    },

    zeroScroll: function() {
      this.scrollingArea.scrollTop(0);
    },

    onContentScroll: function(fn, context) {
      if (context) fn = _.bind(fn, context);
      var scrollingArea = this.scrollingArea;
      var subscription = {
        destroy: function() {
          scrollingArea.unbind('scroll', fn);
        }
      };
      scrollingArea.scroll(fn);
      return subscription;
    },

    contentScrollBottom: function() {
      return this.scrollingArea.scrollTop() + this.scrollingArea.height();
    },

    organization: {
      afterChange: function(organization) {
        this.organizationName.bindHtml(organization, 'name');
        if (organization.currentUserCanEdit()) {
          this.editOrganizationLink.show();
          this.membersLink.show();
        } else {
          this.editOrganizationLink.hide();
          this.membersLink.hide();
        }
      }
    },

    showOrganizationNavigationBar: function() {
      this.alternateNavigationBar.hide();
      this.organizationNavigationBar.show();
    },

    showAlternateNavigationBar: function(text) {
      var lastOrgName = Application.currentUser().defaultOrganization().name();
      this.backToLastOrganizationLink.html("Back to " + htmlEscape(lastOrgName));
      this.alternateNavigationBarText.html(text);
      this.organizationNavigationBar.hide();
      this.alternateNavigationBar.show();
    },

    activateNavigationTab: function(link) {
      this.organizationNavigationBar.find("a").removeClass('active');
      $(this[link]).addClass('active');
    },

    showSubNavigationContent: function(viewName) {
      this.hideSubNavigationContent();
      if (viewName in this.subNavigationContents) {
        this.subNavigationBar.css('height', "28px");
        this.subNavigationContents[viewName].show();
      }
    },

    hideSubNavigationContent: function() {
      _.each(this.subNavigationContents, function(element) {element.hide();});
      this.subNavigationBar.css('height', "8px");
    },

    populateOrganizations: function() {
      var organizations =
        Application.currentUser().admin() ?
          Organization.orderBy('name')
          : Application.currentUser().confirmedMemberships().joinThrough(Organization).orderBy('name');

      organizations.onEach(this.hitch('populateOrganization'));

      Organization.onUpdate(function(organization, changes) {
        if (!changes.name) return;
        var name = organization.name();
        var selector = 'a[organizationId=' + organization.id() + ']';
        this.organizationsMenu.find(selector).html(htmlEscape(name));
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

    showOrHideInviteLink: function() {
      if (Application.currentUser().organizationsPermittedToInvite().empty()) {
        this.inviteLink.hide();
      } else {
        this.inviteLink.show();
      }
    },

    notify: function(message) {
      this.notification.html(message);
      this.notification.slideDown('fast');
      _.delay(_.bind(function() {
        this.notification.slideUp('fast');
        this.notification.empty();
      }, this), 3000);
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

    showInviteForm: function(elt, e) {
      this.darkenBackground.fadeIn();
      this.inviteForm
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

    goToQuestion: function(id) {
      $.bbq.pushState({view: "election", electionId: id}, 2);
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
      var organizationId = Application.currentUser().defaultOrganization().id();
      $.bbq.pushState({view: "organization", organizationId: organizationId }, 2);
    }
  }
});
