_.constructor("Views.OrganizationOverview", View.Template, {
  content: function() { with(this.builder) {
    div({id: "organizationOverview"}, function() {
      div({'class': "grid12", style: "display: none;"}, function() {
        div({'class': "calloutBanner dropShadow"}, function() {
          div({'class': "left"}, function() {
            h1("Hyperarchy makes it easy to put anything to a vote.");
          });
          div({'class': "right"}, function() {
            div(function() {
              text("Click on a question that interests you to chime in, or ");
              a("start a private discussion area").click(function() {
                Application.layout.showAddOrganizationForm();
              });
              text(" for your organization. ");

              div({style: "margin-top: 15px;"}, function() {
                raw("If you're a <em>WorldBlu Live</em> participant, <a href='/worldblu'>click here to join the WorldBlu discussion</a>.");
              })

            }).ref('socialGuestWelcome');
            div(function() {
              text('Here are some questions that ');
              span('').ref('guestWelcomeOrganizationName');
              text(' is discussing. Click on one that interests you to chime in.');
            }).ref('nonSocialGuestWelcome');
          });
          div({'class': "clear"});
        });
      }).ref('guestWelcome');

      div({style: "display: none;", 'class': "grid12"}, function() {
        div({'class': "calloutBanner dropShadow"}, function() {
          div({'class': "left"}, function() {
            h1("Invite your team to share their questions and ideas.");
          });
          div({'class': "right firstUser"}, function() {
            span("Share this secret url with your colleagues to let them raise questions and suggest answers:");
            input({'class': "secretUrl", readonly: "readonly"}, "").ref('secretUrl');
          });
          div({'class': "clear"});
        });
      }).ref("firstUserExplanation");

      h2('Questions Under Discussion');

      subview('electionsList', Views.SortedList, {
        useQueue: true,
        buildElement: function(election) {
          return Views.ElectionLi.toView({election: election});
        },
        onInsert: function(election, li) {
          li.effect('highlight');
        },
        onUpdate: function(li, election, changeset) {
          if (changeset.updatedAt) li.contentDiv.effect('highlight', {color:"#ffffcc"}, 2000);
          if (changeset.body) li.body.html(htmlEscape(changeset.body.newValue));
          if (changeset.voteCount) li.updateVoteCount(changeset.voteCount.newValue);
        }
      });

      div({'class': "clear"});

      div(function() {
        div({id: "rightContent"}, function() {
          a("< Previous");
          span("1-10 of 89");
          a("Next >");
        });
        div({id: "leftContent"}, function() {});
      }).ref("subNavigationContent");

      div({'class': "bigLoading", 'style': "display: none;"}).ref('loading');
    });
  }},

  viewProperties: {
    defaultView: true,
    viewName: 'organization',

    initialize: function() {
      this.subscriptions = new Monarch.SubscriptionBundle();
    },

    navigate: function(state) {
      if (!state.organizationId) {
        $.bbq.pushState({view: 'organization', organizationId: Application.currentUser().defaultOrganization().id()});
        return;
      }
      var organizationId = parseInt(state.organizationId);
      this.organizationId(organizationId);
      this.toggleFirstUserExplanation();

      Application.layout.activateNavigationTab("questionsLink");
      Application.layout.hideSubNavigationContent();
    },

    afterHide: function() {
      if (this.userSwitchSubscription) {
        this.userSwitchSubscription.destroy();
      }
    },

    organizationId: {
      afterChange: function(organizationId) {
        if (this.organization()) {
          Application.currentOrganizationId(organizationId);
          var membership = this.organization().membershipForCurrentUser();
          if (membership) membership.update({lastVisited: new Date()});
          this.subscriptions.destroy();
          this.displayElections();
        } else {
          var lastVisitedOrgId = Application.currentUser().defaultOrganization().id();
          $.bbq.pushState({view: 'organization', organizationId: lastVisitedOrgId}, 2);
        }
      }
    },

    organization: function() {
      return Organization.find(this.organizationId());
    },

    displayElections: function() {
      if (this.electionLisById) {
        _.each(this.electionLisById, function(li) {
          li.remove();
        });
      }
      this.electionLisById = {};

      this.startLoading();
      this.organization().fetchMoreElections(16).success(_.bind(function() {
        this.toggleGuestWelcome();
        this.stopLoading();
        var elections = this.organization().elections();
        this.electionsList.relation(elections);
        this.subscribeToVisits(elections);

        this.subscriptions.add(Application.layout.onContentScroll(function() {
          if (this.remainingScrollDistance() < 600) {
            this.organization().fetchMoreElections();
          }
        }, this));
      }, this));
    },

    toggleFirstUserExplanation: function() {
      if (this.organization().memberCount() <= 2 && !Application.currentUser().guest()) {
        this.secretUrl.val(this.organization().membershipUrl());
        this.firstUserExplanation.show();
      } else {
        this.firstUserExplanation.hide();
      }
    },

    remainingScrollDistance: function() {
      return this.height() - Application.layout.contentScrollBottom();
    },

    subscribeToVisits: function(elections) {
      this.subscriptions.add(elections.joinThrough(Application.currentUser().electionVisits()).onInsert(function(visit) {
        this.electionsList.elementForRecord(visit.election()).visited();
      }, this));
    },

    editOrganization: function(elt, e) {
      e.preventDefault();
      $.bbq.pushState({view: "editOrganization", organizationId: this.organizationId()}, 2);
    },

    toggleGuestWelcome: function() {
      if (Application.currentUser().guest()) {
        this.userSwitchSubscription = Application.onUserSwitch(this.hitch('toggleGuestWelcome'));

        if (this.organization().social()) {
          this.nonSocialGuestWelcome.hide();
          this.socialGuestWelcome.show();
        } else {
          this.guestWelcomeOrganizationName.html(this.organization().name());
          this.nonSocialGuestWelcome.show();
          this.socialGuestWelcome.hide();
        }
        this.guestWelcome.show();
      } else {
        this.guestWelcome.hide();
      }
    },

    startLoading: function() {
      this.loading.show();
    },

    stopLoading: function() {
      this.loading.hide();
    }
  }
});
