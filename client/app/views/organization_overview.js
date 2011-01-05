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
          if (changeset.body) li.body.html(changeset.body.newValue);
          if (changeset.voteCount) li.updateVoteCount(changeset.voteCount.newValue);
        }
      });

      div({'class': "clear"});
      div({'class': "bigLoading", 'style': "display: none;"}).ref('loading');
    });
  }},

  viewProperties: {
    defaultView: true,
    viewName: 'organization',
    itemsPerPage: 16,

    initialize: function() {
      this.subscriptions = new Monarch.SubscriptionBundle();
    },

    navigate: function(state) {
      if (!state.organizationId) {
        $.bbq.pushState({view: 'organization', organizationId: Application.currentUser().lastVisitedOrganization().id()});
        return;
      }
      var organizationId = parseInt(state.organizationId);
      var pageNumber = state.page ? parseInt(state.page) : 1;
      Application.currentOrganizationId(organizationId);
      this.organizationId(organizationId);
      this.pageNumber(pageNumber);
      this.createElectionForm.hide();
      this.showCreateElectionFormButton.show();
    },

    organizationId: {
      afterChange: function(organizationId) {
        var membership = this.organization().membershipForCurrentUser();
        if (membership) membership.update({lastVisited: new Date()});
        if (this.pageNumber()) this.assignElectionsRelation();
      }
    },

    organization: function() {
      return Organization.find(this.organizationId());
    },

    pageNumber: {
      afterChange: function(pageNumber) {
        if (this.organizationId()) this.assignElectionsRelation();
      }
    },

    assignElectionsRelation: function() {
      var offset = (this.pageNumber() - 1) * this.itemsPerPage;
      var limit = this.itemsPerPage;
      var elections = this.organization().elections().offset(offset).limit(limit);
      this.electionsRelation(elections);
    },

    electionsRelation: {
      afterChange: function(relation) {
        this.displayElections(relation);
      }
    },

    displayElections: function(elections) {
      this.subscriptions.destroy();

      if (this.electionLisById) {
        _.each(this.electionLisById, function(li) {
          li.remove();
        });
      }
      this.electionLisById = {};

      this.startLoading();

      // still fetching all elections for now... this needs to be worked out
      var relationsToFetch = [
        this.organization().elections(),
        this.organization().elections().joinTo(Candidate),
        Application.currentUser().electionVisits()
      ];

      Server.fetch(relationsToFetch)
        .onSuccess(function() {
          this.stopLoading();
        this.electionsList.relation(elections);
        this.subscribeToVisits(elections);
      }, this);
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
