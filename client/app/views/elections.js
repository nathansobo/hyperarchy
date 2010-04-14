_.constructor("Views.Elections", View.Template, {
  content: function() { with(this.builder) {
    div({'class': "elections"}, function() {
      div({'class': "grid4"}, function() {
        div({'class': "body largeFont"}).ref('bodyDiv');
        a({href: "#", id: "createCandidate"}, "Suggest A New Answer...")
          .click('showCreateCandidateForm')
          .ref('createCandidateLink');
        div({id: "createCandidateForm", style: "display: none"}, function() {
          textarea({rows: 3});
          button("Suggest Answer").ref('createCandidateButton');
        }).ref('createCandidateForm');
      });


      div({'class': "grid4"}, function() {
        div({'class': "sectionLabel"}, "Current Consensus");
        ol({'class': "candidates"}).ref('candidatesList');
      });

      div({'class': "grid4"}, function() {
        div({'class': "sectionLabel"}, "Your Ranking");
        ol({'class': "candidates"});
      })
    });
  }},

  viewProperties: {
    election: {
      afterChange: function(newElection) {
        this.bodyDiv.html(newElection.body());
        this.candidatesList.empty();
        newElection.candidates().each(function(candidate) {
          this.candidatesList.appendView(function(b) {
            b.li(candidate.body());
          })
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
      this.createCandidateForm.show();
      return false;
    }
  }
});
