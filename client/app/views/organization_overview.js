_.constructor("Views.OrganizationOverview", View.Template, {
  content: function() { with(this.builder) {
    div({id: "organizations"}, function() {
      div({'class': "top grid12"}, function() {
        div({'id': "organizationHeader"}, function() {
          div({'id': "title"}, function() {
            a({href: "#", id: 'createElectionLink', 'class': "glossyBlack"}, "Raise A New Question")
              .ref('showCreateElectionFormButton')
              .click('showCreateElectionForm');
            h1().ref("organizationName");
            h2("| Questions Under Discussion");
          });
          div({style: "clear: both"});

          div({id: 'createElectionForm'}, function() {
            a({'class': "glossyBlack"}, "Raise Question")
              .ref('createElectionButton')
              .click('createElection');
            input({placeholder: "Type your question here"})
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
      this.electionsList.empty();
      Server.fetch([this.organization().elections(), this.organization().elections().joinTo(Candidate)])
        .onSuccess(function() {
          this.organization().elections().each(function(election) {
            this.electionsList.append(Views.ElectionLi.toView({election: election}));
          }, this);
        }, this);
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
      this.createElectionButton.attr('disabled', true);
      this.organization().elections().create({body: this.createElectionInput.val()})
        .onSuccess(function(election) {
          $.bbq.pushState({view: "election", electionId: election.id()});
        }, this);
    }
  }
});
