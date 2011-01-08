_.constructor("Views.NewElection", View.Template, {
  content: function() { with(this.builder) {
    div({id: "newElection"}, function() {
      div({id: 'createElectionForm'}, function() {
        h2("Raise a New Question")
        input({placeholder: "Type your question here"})
          .keypress(function(view, e) {
            if (e.keyCode === 13) {
              view.createElectionButton.click();
              return false;
            }
          })
          .ref('createElectionInput');
        a({'class': "glossyLightGray roundedButton"}, "Raise Question")
                  .ref('createElectionButton')
                  .click('createElection');
      }).ref('createElectionForm');

      div({'class': "clear"});

      div({'class': "bigLoading", 'style': "display: none;"}).ref('loading');
    });
  }},

  viewProperties: {
    defaultView: true,
    viewName: 'newElection',

    initialize: function() {
      this.subscriptions = new Monarch.SubscriptionBundle();
    },

    navigate: function(state) {
      if (!state.organizationId) {
        $.bbq.pushState({view: 'organization', organizationId: Application.currentUser().lastVisitedOrganization().id()});
        return;
      }
      var organizationId = parseInt(state.organizationId);
      Application.currentOrganizationId(organizationId);
      this.organizationId(organizationId);

      Application.layout.activateHeaderTab("newElectionLink");
      Application.layout.showSubheaderContent("");
    },

    organizationId: {
      afterChange: function(organizationId) {
        var membership = this.organization().membershipForCurrentUser();
        if (membership) membership.update({lastVisited: new Date()});
        this.subscriptions.destroy();
      }
    },

    organization: function() {
      return Organization.find(this.organizationId());
    },

    editOrganization: function(elt, e) {
      e.preventDefault();
      $.bbq.pushState({view: "editOrganization", organizationId: this.organizationId()}, 2);
    },

    createElection: function() {
      var body = this.createElectionInput.val();
      if (this.creatingElection || body === "") return;
      this.creatingElection = true;
      this.organization().elections().create({body: body})
        .onSuccess(function(election) {
          this.creatingElection = false;
          this.createElectionInput.val("");
          $.bbq.pushState({view: "election", electionId: election.id()});
        }, this);
    },

    startLoading: function() {
      this.loading.show();
    },

    stopLoading: function() {
      this.loading.hide();
    }
  }
});
