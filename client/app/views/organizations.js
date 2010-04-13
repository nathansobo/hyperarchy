_.constructor("Views.Organizations", View.Template, {
  content: function() { with(this.builder) {
    div({id: "organizations", 'class': "container12"}, function() {
      div({id: "header", 'class': "grid12"}, function() {
        div({'class': "grid2 alpha"}, function() {
          h3({id: "title"}, "hyperarchy");
        });
        div({'class': "grid2 prefix8 omega", style: "display: none"}, function() {
          span("organization:");
          select()
            .ref("organizationSelect")
            .change(function(view) {
              view.organizationSelectChanged();
            });
        });
      });

      div({'class': "top grid12"}, function() {
        a({href: "#", 'class': 'createElection'}, "Raise a New Question...")
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
    initialize: function() {
      this.fetchingOrganizations = Organization.fetch();
      this.fetchingOrganizations.afterEvents(function() {
        Organization.each(function(organization) {
          this.organizationSelect.appendView(function(b) {
            b.option({value: organization.id()}, organization.name());
          });
        }, this);
        delete this.fetchingOrganizations;
      }, this);
    },

    navigate: function(path) {
      if (this.fetchingOrganizations) {
        this.fetchingOrganizations.afterEvents(function() {
          this.navigate(path);
        }, this);
        return;
      }

      if (path) {
        var fragments = path.split("/");
        var organizationId = fragments[0];
        this.displayOrganization(organizationId);
        if (fragments[1] == "elections" && fragments[2]) {
          this.electionsView.navigate(fragments[2]);
        } 
      } else {
        History.load("organizations/" + Organization.first().id());
      }
    },

    displayOrganization: function(organizationId) {
      this.organization = Organization.find(organizationId);
      this.displayElections();
    },

    displayElections: function() {
      Server.fetch([this.organization.elections(), this.organization.elections().joinTo(Candidate)])
        .onSuccess(function() {
          this.organization.elections().each(function(election) {
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
      this.organization.elections().create({body: this.createElectionInput.val()})
        .onSuccess(function(election) {
          console.debug(election.id());
//          History.load("elections/" + election.id());
        });
    },

    organizationSelectChanged: function() {
      History.load("organizations/" + this.organizationSelect.val());
    }
  }
});
