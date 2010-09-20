_.constructor("Views.OrganizationOverview", View.Template, {
  content: function() { with(this.builder) {
    div({id: "organizationOverview"}, function() {
      div({'class': "top grid12"}, function() {
        div({id: "welcomeBlurb"}, function() {
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
    });
  }},

  viewProperties: {
    defaultView: true,
    viewName: 'organization',

    navigate: function(state) {
      var organizationId = state.organizationId || Organization.find({name: "Alpha Testers"}).id();
      this.organizationId(organizationId);
      this.createElectionForm.hide();
      this.showCreateElectionFormButton.show();
    },

    organizationId: {
      afterChange: function() {
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

      Server.fetch([this.organization().elections(), this.organization().elections().joinTo(Candidate)])
        .onSuccess(function() {
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
          }, this);

          Server.subscribe([
            elections,
            elections.joinThrough(Candidate)
          ]);
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
    }
  },

  welcomeBlurbText: "<strong>Thanks for trying out Hyperarchy.</strong> This is the Alpha Testers group, where you can interact with everyone else we have invited. You can create and access your own private groups from the <em>Organizations</em> menu above. If you have any ideas or concerns, please raise them here so everyone can vote on them. But feel free to raise questions about anything in this group&mdash;they don't need to relate to Hyperarchy directly. Looking forward to your feedback!"
});
