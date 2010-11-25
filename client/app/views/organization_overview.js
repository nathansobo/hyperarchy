_.constructor("Views.OrganizationOverview", View.Template, {
  content: function() { with(this.builder) {
    div({id: "organizationOverview"}, function() {
      div({'class': "top grid12"}, function() {
        div({id: "welcomeBlurb", 'class': "dropShadow"}, function() {
          div({'class': "dismissX"}).click('dismissWelcomeBlurb');
          raw(template.welcomeBlurbText);
        }).ref('welcomeBlurb');

        div({'id': "organizationHeader"}, function() {
          div({'id': "title"}, function() {
            a({href: "#", id: 'createElectionLink', 'class': "glossyBlack roundedButton"}, "Raise A New Question")
              .ref('showCreateElectionFormButton')
              .click('showCreateElectionForm');
            h1().ref("organizationName");
            h2("| Questions Under Discussion");
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

      div({'class': "bigLoading", 'style': "display: none;"}).ref('loading');
    });
  }},

  viewProperties: {
    defaultView: true,
    viewName: 'organization',

    initialize: function() {
      this.subscriptions = new Monarch.SubscriptionBundle();
    },

    beforeShow: function() {
      if (Application.currentUser().dismissedWelcomeBlurb()) this.welcomeBlurb.hide();
    },

    navigate: function(state) {
      if (!state.organizationId) {
        $.bbq.pushState({view: 'organization', organizationId: Application.currentUser().lastVisitedOrganization().id()});
        return;
      }
      this.organizationId(state.organizationId);
      this.createElectionForm.hide();
      this.showCreateElectionFormButton.show();
    },

    organizationId: {
      afterChange: function(organizationId) {
        Application.currentOrganizationId(organizationId);
        var membership = this.organization().membershipForCurrentUser();
        if (membership) membership.update({lastVisited: new Date()});
        if (membership && membership.role() !== "owner") this.welcomeBlurb.hide();
        
        this.subscriptions.destroy();
        this.subscriptions.add(this.organization().field('name').onUpdate(function(newName) {
          this.organizationName.html(newName);
        }, this));

        this.organizationName.html(this.organization().name());
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

      Server.fetch([this.organization().elections(), this.organization().elections().joinTo(Candidate)])
        .onSuccess(function() {
          this.stopLoading();
          var elections = this.organization().elections();

          elections.each(function(election) {
            this.electionsList.append(this.electionLi(election));
          }, this);

          elections.onRemoteInsert(function(election) {
            this.electionsList.prepend(this.electionLi(election));
          }, this);

          elections.onRemoteRemove(function(election) {
            this.electionLi(election).remove();
          }, this);

          elections.onRemoteUpdate(function(election, changes) {
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
          }, this);
        }, this);
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
      this.createElectionForm.show();
      this.showCreateElectionFormButton.hide();
      this.createElectionInput.focus();
      e.preventDefault();
    },

    createElection: function() {
      var body = this.createElectionInput.val();
      if (body === "") return;

      this.createElectionButton.attr('disabled', true);
      this.organization().elections().create({body: body})
        .onSuccess(function(election) {
          this.createElectionInput.val("");
          $.bbq.pushState({view: "election", electionId: election.id()});
        }, this);
    },

    dismissWelcomeBlurb: function() {
      this.welcomeBlurb.slideUp('fast');
      Server.post("/dismiss_welcome_blurb")
    },

    startLoading: function() {
      this.loading.show();
    },

    stopLoading: function() {
      this.loading.hide();
    }
  },

  welcomeBlurbText: "<strong>Welcome to Hyperarchy.</strong> This is a private discussion area for your organization. Start by raising a question and adding a few answers. Then you can invite people to vote from the <em>Admin</em> menu at the top of the page."
});
