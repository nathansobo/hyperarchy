_.constructor("Views.Elections", View.Template, {
  content: function() { with(this.builder) {
    div({'class': "elections"}, function() {
      div({'class': "grid4"}, function() {
        div({'class': "body largeFont"}).ref('bodyDiv');

        a({href: "#", id: "createCandidate"}, "Suggest A New Answer...")
          .click('showCreateCandidateForm')
          .ref('createCandidateLink');

        div({id: "createCandidateForm", style: "display: none"}, function() {
          textarea({rows: 3})
            .ref('createCandidateTextarea')
            .click(function() {
              this.val("");
              this.removeClass('grayText');
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
    initialize: function() {
      this.subscriptions = new Monarch.SubscriptionBundle();
    },

    election: {
      afterChange: function(election) {
        this.bodyDiv.html(election.body());

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

    navigate: function(electionId) {
      var election = Election.find(electionId);

      if (election) {
        this.election(election);
      } else {
        Server.fetch([
          Election.where({id: electionId}),
          Candidate.where({electionId: electionId})
        ]).onSuccess(function() {
          this.navigate(electionId);
        }, this);
      }
    },

    showCreateCandidateForm: function() {
      this.createCandidateLink.hide();
      this.createCandidateTextarea.addClass('grayText');
      this.createCandidateTextarea.val('Type your suggestion here.')
      this.createCandidateButton.attr('disabled', false);
      this.createCandidateForm.show();
      return false;
    },

    createCandidate: function() {
      this.createCandidateButton.attr('disabled', true);
      this.election().candidates().create({body: this.createCandidateTextarea.val()})
        .onSuccess(function() {
          this.createCandidateForm.hide();
          this.createCandidateLink.show();
        }, this);
    }
  }
});
