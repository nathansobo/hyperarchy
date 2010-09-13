_.constructor("Views.ElectionOverview", View.Template, {
  content: function() { with(this.builder) {
    div({'id': "electionOverview"}, function() {
      div({'class': "grid4"}, function() {
        h1({'class': "clickable"})
          .click('goToOrganization')
          .ref('organizationName');

        // if (candidate.belongsToCurrentUser() || candidate.organization().currentUserIsOwner()) {
        div({'class': "expandArrow"})
          .ref('expandArrow')
          .click('expandOrContract');

        div({id: "electionBodyContainer"}, function() {
          textarea({'class': "electionBody", style: "display: none;"}).ref('bodyTextarea');
          div({'class': "electionBody largeFont"}).ref('bodyDiv');
        });

        div({id: "expandedArea", style: "display: none;"}, function() {
          button("Save");
          button("Delete Question");
          div({'class': "clear"});
        }).ref('expandedArea');

        div({id: "createCandidateForm"}, function() {
          textarea({placeholder: "Type your own suggestion here.", rows: 3})
            .ref('createCandidateTextarea')
            .keypress(function(view, e) {
              if (e.keyCode === 13) {
                view.createCandidateButton.click();
                return false;
              }
            });

          button("Suggest Answer")
            .click('createCandidate')
            .ref('createCandidateButton');
        }).ref('createCandidateForm');
      });


      div({'class': "grid4"}, function() {
        subview('candidatesList', Views.CandidatesList);
      });

      div({'class': "grid4"}, function() {
        subview('rankedCandidatesList', Views.RankedCandidatesList);
      });
    });
  }},

  viewProperties: {
    viewName: 'election',

    initialize: function() {
      this.subscriptions = new Monarch.SubscriptionBundle();
      this.defer(function() {
        this.createCandidateTextarea.elastic();
        this.bodyTextarea.elastic();
      });
    },

    navigate: function(state) {
      var electionId = state.electionId;
      var election = Election.find(electionId);

      if (!election) {
        Server.fetch([
          Election.where({id: electionId}).joinTo(Organization),
          Candidate.where({electionId: electionId})
        ]).onSuccess(this.hitch('navigate', state));
        return;
      }

      this.candidatesList.adjustHeight();
      this.rankedCandidatesList.adjustHeight();
      this.election(election);
    },

    election: {
      afterChange: function(election) {
        this.subscriptions.destroy();

        this.organizationName.html(election.organization().name());
        this.bodyTextarea.val(election.body());
        this.bodyDiv.html(election.body());

        this.candidatesList.empty();
        this.rankedCandidatesList.empty();

        Server.fetch([election.candidates(), election.rankingsForCurrentUser()])
          .onSuccess(function() {
            this.candidatesList.election(election);
            this.rankedCandidatesList.election(election);
          }, this);

        election.candidates().subscribe().onSuccess(function(subscription) {
          this.subscriptions.add(subscription);
        }, this);
      }
    },

    createCandidate: function() {
      var body = this.createCandidateTextarea.val();
      if (body === "") return;
      
      this.createCandidateButton.attr('disabled', true);
      this.election().candidates().create({body: body})
        .onSuccess(function() {
          this.createCandidateButton.attr('disabled', false);
          this.createCandidateTextarea.val("");
        }, this);
    },

    goToOrganization: function() {
      $.bbq.pushState({view: "organization", organizationId: this.election().organizationId() }, 2);
    },

    expandOrContract: function() {
      if (this.expanded) {
        this.expandArrow.removeClass('expanded');
        this.expanded = false;
        this.bodyTextarea.hide();
        this.bodyDiv.show();
        this.expandedArea.slideUp('fast');
      } else {
        this.expanded = true;
        this.expandArrow.addClass('expanded');
        this.bodyTextarea.keyup();       
        this.bodyTextarea.show();
        this.bodyTextarea.focus();
        this.bodyDiv.hide();
        this.expandedArea.slideDown('fast');
      }
    }
  }
});
