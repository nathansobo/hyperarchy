_.constructor("Views.Organizations", View.Template, {
  content: function() { with(this.builder) {
    div({id: "organizations"}, function() {
      div({'class': "top grid12"}, function() {
        a({href: "#", 'class': 'createElection'}, "Raise A New Question...")
          .ref('createElectionLink')
          .click('showCreateElectionForm');

        div({id: 'createElectionForm', style: "display: none;"}, function() {
          input()
            .ref('createElectionInput')
            .click(function() {
              this.val("");
              this.removeClass('grayText');
            });
          button("Raise Question")
            .ref('createElectionButton')
            .click('createElection');
        }).ref('createElectionForm');
      }).ref('topDiv');

      ol(function() {
        
      }).ref('electionsList');
    });
  }},

  viewProperties: {
    navigate: function(organizationId) {
      this.organization(Organization.find(organizationId));
    },

    organization: {
      afterChange: function() {
        this.displayElections();
      }
    },

    displayElections: function() {
      this.electionsList.empty();
      Server.fetch([this.organization().elections(), this.organization().elections().joinTo(Candidate)])
        .onSuccess(function() {
          this.organization().elections().each(function(election) {
            this.electionsList.append(Views.ElectionLi.toView({election: election}));
          }, this);
        }, this);
    },

    showCreateElectionForm: function() {
      this.createElectionLink.hide();
      this.createElectionForm.show();
      this.createElectionInput.val("Type your question here.");
      this.createElectionInput.addClass('grayText');
      return false;
    },

    createElection: function() {
      this.createElectionButton.attr('disabled', true);
      this.organization().elections().create({body: this.createElectionInput.val()})
        .onSuccess(function(election) {
          History.load("elections/" + election.id());
        });
    }
  }
});
