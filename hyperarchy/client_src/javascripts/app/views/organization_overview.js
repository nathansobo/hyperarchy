_.constructor("Views.OrganizationOverview", View.Template, {
  content: function() { with(this.builder) {
    div({id: "organizationOverview"}, function() {
      div({'class': "grid12", style: "display: none;"}, function() {
        div({'class': "guestWelcome dropShadow"}, function() {
          div({'class': "left"}, function() {
            h1("Hyperarchy makes it easy to put anything to a vote.");
          });
          div({'class': "right"},
            "Here are the top-ranked answers to questions we're discussing right now. " +
            "Click on a question that interests you to chime in."
          );
          div({'class': "clear"});
        });
      }).ref('guestWelcome');

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
      Application.currentOrganizationId(organizationId);
      this.organizationId(organizationId);

      this.toggleGuestWelcome();

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
        this.toggleGuestWelcome();
        var membership = this.organization().membershipForCurrentUser();
        if (membership) membership.update({lastVisited: new Date()});

        this.subscriptions.destroy();
        this.displayElections();
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
      if (this.organization().social() && Application.currentUser().guest()) {
        this.userSwitchSubscription = Application.onUserSwitch(this.hitch('toggleGuestWelcome'));
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
