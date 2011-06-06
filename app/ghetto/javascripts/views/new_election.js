_.constructor("Views.NewElection", View.Template, {
  content: function() { with(this.builder) {
    div({id: "newElection"}, function() {
      div({'class': "", style: "display: none;"}, function() {
        div({'class': "calloutBanner dropShadow"}, function() {
          div({'class': "left", style: "text-align: left;"}, function() {
            h1({style: "text-align"}, "Ask your team a question.");
            div("In the next step, you'll invite your colleagues to suggest and vote on answers to this question.");
          });
          div({'class': "right"}, function() {
            div({'class': "ideas"}, "Here are some ideas:");
            ul(function() {
              li("What should we discuss at our next meeting?");
              li("What should be our goals for the next quarter?");
              li("What do we need to improve about our process?");
            });
          });
          div({'class': "clear"});
        });
      }).ref('firstQuestionExplanationBanner');

      h2("Raise a New Question").ref("header");
      textarea({placeholder: "Type your question here", tabindex: 1})
        .keypress(function(view, e) {
          if (e.keyCode === 13) {
            view.createElectionButton.click();
            return false;
          }
        })
        .ref('createElectionTextarea');
      a({'class': "glossyLightGray roundedButton", tabindex: 2}, "Raise Question")
                .ref('createElectionButton')
                .click('createElection');

      div({'class': "clear"});

      div({'class': "bigLoading", 'style': "display: none;"}).ref('loading');
    });
  }},

  viewProperties: {
    defaultView: true,
    viewName: 'newElection',

    initialize: function() {
      this.subscriptions = new Monarch.SubscriptionBundle();
      this.createElectionTextarea.holdPlace();
    },

    navigate: function(state) {
      if (!state.organizationId) {
        $.bbq.pushState({view: 'organization', organizationId: Application.currentUser().defaultOrganization().id()});
        return;
      }
      var organizationId = parseInt(state.organizationId);
      Application.currentOrganizationId(organizationId);
      this.organizationId(organizationId);


      Application.layout.activateNavigationTab("newElectionLink");
      Application.layout.hideSubNavigationContent();


      this.toggleFirstQuestionExplanation();

      this.createElectionTextarea.focus();
    },

    organizationId: {
      change: function(organizationId) {
        this.subscriptions.destroy();
        var membership = this.organization().membershipForCurrentUser();
        if (membership) membership.update({lastVisited: new Date()});
        this.toggleFirstQuestionExplanation();
      }
    },

    organization: function() {
      return Organization.find(this.organizationId());
    },

    editOrganization: function(elt, e) {
      e.preventDefault();
      $.bbq.pushState({view: "editOrganization", organizationId: this.organizationId()}, 2);
    },

    createElection: function(elt, e) {
      e.preventDefault();
      var body = this.createElectionTextarea.val();
      if (this.creatingElection || body === "") return;

      this.organization().ensureCurrentUserCanParticipate()
        .onSuccess(function() {
          this.creatingElection = true;
          this.organization().elections().create({body: body})
            .onSuccess(function(election) {
              this.creatingElection = false;
              this.createElectionTextarea.val("");
              $.bbq.pushState({view: "election", electionId: election.id()});
            }, this);
        }, this);
    },

    toggleFirstQuestionExplanation: function() {
      if (this.organization().electionCount() > 0) {
        this.firstQuestionExplanationBanner.hide();
        this.header.show();
      } else {
        this.header.hide();
        this.firstQuestionExplanationBanner.show();
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
