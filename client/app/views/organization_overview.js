_.constructor("Views.OrganizationOverview", View.Template, {
  content: function() { with(this.builder) {
    div({id: "organizationOverview"}, function() {
      div({'class': "top grid12"}, function() {
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
        })

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

    resetCreateElectionForm: function() {
      this.createElectionInput.val("Type your question here.");
      this.createElectionInput.addClass("grayText");
      this.createElectionButton.attr('disabled', false);
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
      this.electionLisById = {};
      this.electionsList.empty();

      Server.fetch([this.organization().elections(), this.organization().elections().joinTo(Candidate)])
        .onSuccess(function() {
          var elections = this.organization().elections();

          elections.each(function(election) {
            this.electionsList.append(this.electionLi(election));
          }, this);

          elections.onRemoteInsert(function(election) {
            this.electionsList.prepend(this.electionLi(election));
          }, this);

          elections.onRemoteUpdate(function(election, changes) {
            if (changes.updatedAt) {
              var electionLi = this.electionLi(election);
              this.electionsList.prepend(electionLi);
              electionLi.find("> div").effect('highlight', {color:"#ffffcc"}, 2000);
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
    }
  }
});
