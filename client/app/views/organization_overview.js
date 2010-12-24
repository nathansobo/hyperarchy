_.constructor("Views.OrganizationOverview", View.Template, {
  content: function() { with(this.builder) {
    div({id: "organizationOverview"}, function() {
      div({'class': "top grid12"}, function() {
        div({'id': "organizationHeader"}, function() {
          div({'id': "title"}, function() {
            a({href: "#", id: 'createElectionLink', 'class': "glossyBlack roundedButton"}, "Raise A New Question")
              .ref('showCreateElectionFormButton')
              .click('showCreateElectionForm');
            h2("Questions Under Discussion");
          });
          div({style: "clear: both"});

          div({id: 'createElectionForm'}, function() {
            a({'class': "glossyBlack roundedButton"}, "Raise Question")
              .ref('createElectionButton')
              .click('createElection');
            input({placeholder: "Type your question here"})
              .keypress(function(view, e) {
                if (e.keyCode === 13) {
                  view.createElectionButton.click();
                  return false;
                }
              })
              .ref('createElectionInput');
          }).ref('createElectionForm');
        });
      }).ref('topDiv');


      ol(function() {
        
      }).ref('electionsList');

      div({'class': "clear"});
      div({'class': "bigLoading", 'style': "display: none;"}).ref('loading');
    });
  }},

  viewProperties: {
    defaultView: true,
    viewName: 'organization',

    initialize: function() {
      this.subscriptions = new Monarch.SubscriptionBundle();
      this.renderQueue = new Monarch.Queue(2);
    },

    navigate: function(state) {
      if (!state.organizationId) {
        $.bbq.pushState({view: 'organization', organizationId: Application.currentUser().lastVisitedOrganization().id()});
        return;
      }
      var organizationId = parseInt(state.organizationId);
      Application.currentOrganizationId(organizationId);
      this.organizationId(organizationId);
      this.createElectionForm.hide();
      this.showCreateElectionFormButton.show();
    },

    organizationId: {
      afterChange: function(organizationId) {
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

      var relationsToFetch = [
        this.organization().elections(),
        this.organization().elections().joinTo(Candidate),
        Application.currentUser().electionVisits()
      ];

      Server.fetch(relationsToFetch)
        .onSuccess(function() {
          this.stopLoading();
          var elections = this.organization().elections();
          this.renderElections(elections);
          this.subscribeToElections(elections);
        }, this);
    },

    renderElections: function(elections) {
      this.renderQueue.clear();
      elections.each(function(election) {
        this.renderQueue.add(function() {
          this.electionsList.append(this.electionLi(election));
        }, this);
      }, this);
      this.renderQueue.start();
    },

    subscribeToElections: function(elections) {
      this.subscriptions.add(elections.onRemoteInsert(function(election) {
        this.electionsList.prepend(this.electionLi(election));
      }, this));

      this.subscriptions.add(elections.onRemoteRemove(function(election) {
        this.electionLi(election).remove();
      }, this));

      this.subscriptions.add(elections.onRemoteUpdate(function(election, changes) {
        if (changes.updatedAt) {
          var electionLi = this.electionLi(election);
          this.electionsList.prepend(electionLi);
          electionLi.find("> div").effect('highlight', {color:"#ffffcc"}, 2000);
        }

        if (changes.body) {
          var electionLi = this.electionLi(election);
          electionLi.body.html(changes.body.newValue);
        }

        if (changes.voteCount) {
          var electionLi = this.electionLi(election);
          electionLi.updateVoteCount(changes.voteCount.newValue);
        }
      }, this));

      this.subscriptions.add(elections.joinTo(Application.currentUser().electionVisits()).project(ElectionVisit).onRemoteInsert(function(visit) {
        this.electionLi(visit.election()).visited();
      }, this));
    },

    electionLi: function(election) {
      var id = election.id();
      if (!this.electionLisById[id]) {
        this.electionLisById[id] = Views.ElectionLi.toView({election: election});
      }
      return this.electionLisById[election.id()];
    },

    editOrganization: function(elt, e) {
      e.preventDefault();
      $.bbq.pushState({view: "editOrganization", organizationId: this.organizationId()}, 2);
    },

    showCreateElectionForm: function(elt, e) {
      Application.welcomeGuide.raiseQuestionClicked();
      this.createElectionForm.slideDown('fast');
      this.showCreateElectionFormButton.hide();
      this.createElectionInput.focus();
      e.preventDefault();
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
