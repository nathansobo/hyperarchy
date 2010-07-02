_.constructor("Views.OrganizationOverview", View.Template, {
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
    defaultView: true,
    viewName: 'organization',

    navigate: function(state) {
      var organizationId = state.organizationId || Organization.find({name: "Global"}).id(); 
      this.organizationId(organizationId);

      if (state.showCreateElectionForm) {
        this.createElectionLink.hide();
        this.resetCreateElectionForm();
        this.createElectionForm.show();
      } else {
        this.createElectionLink.show();
        this.createElectionForm.hide();
      }
    },

    resetCreateElectionForm: function() {
      this.createElectionInput.val("Type your question here.");
      this.createElectionInput.addClass("grayText");
      this.createElectionButton.attr('disabled', false);
    },

    organizationId: {
      afterChange: function() {
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

    showCreateElectionForm: function(elt, e) {
      $.bbq.pushState({showCreateElectionForm:true});
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
