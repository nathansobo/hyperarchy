_.constructor("Views.Elections", View.Template, {
  content: function() { with(this.builder) {
    div({'class': "elections"}, function() {
      div({'class': "grid4"}, function() {
        div({'class': "body largeFont"}).ref('bodyDiv');

        div({id: "createCandidateForm"}, function() {
          textarea({'class': "grayText", rows: 3}, "Type your own suggestion here.")
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
      this.registerView('election');
      this.subscriptions = new Monarch.SubscriptionBundle();
    },

    navigate: function(state) {
      var electionId = state.electionId;
      var election = Election.find(electionId);

      if (!election) {
        Server.fetch([
          Election.where({id: electionId}),
          Candidate.where({electionId: electionId})
        ]).onSuccess(_.bind(this.navigate, this, state));
        return;
      }

      this.election(election);
    },

    election: {
      afterChange: function(election) {
        this.subscriptions.destroy();
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

    createCandidate: function() {
      this.createCandidateButton.attr('disabled', true);
      this.election().candidates().create({body: this.createCandidateTextarea.val()})
        .onSuccess(function() {
          this.createCandidateTextarea.addClass("grayText");
          this.createCandidateTextarea.val("Type your own suggestion here.");
        }, this);
    }
  }
});
