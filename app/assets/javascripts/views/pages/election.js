_.constructor('Views.Pages.Election', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "election"}, function() {
      div({id: "columns"}, function() {
        div(function() {
          div({'class': 'body'}).ref('body');
        });
        div(function() {
          subview('currentConsensus', Views.Pages.Election.CurrentConsensus);
        });
        div(function() {
          subview('candidateDetails', Views.Pages.Election.CandidateDetails);
          subview('rankedCandidates', Views.Pages.Election.RankedCandidates);
        });
        div({id: "column-4"});
      }).ref('columns');
    });
  }},

  viewProperties: {
    initialize: function() {
      this.currentConsensus.candidateDetails = this.candidateDetails;
    },

    params: {
      change: function(params, oldParams) {
        var relationsToFetch = [];

        if (!oldParams || params.electionId !== oldParams.electionId) {
          var election = Election.find(params.electionId);
          if (election) {
            this.election(election);
          } else {
            relationsToFetch.push(Election.where({id: params.electionId}));
          }
          relationsToFetch.push(Candidate.where({electionId: params.electionId}))
        }

        if (!params.candidateId) {
          var voterId = params.voterId || Application.currentUserId();
          relationsToFetch.push(Ranking.where({electionId: params.electionId, userId: voterId}));
        }

        return Server.fetch(relationsToFetch).success(this.hitch('populateContent', params));
      }
    },

    populateContent: function(params) {
      var election = Election.find(params.electionId);

      if (!election) {
        History.pushState(null, null, Application.currentUser().defaultOrganization().url());
        return;
      }

      this.election(election);
      this.currentConsensus.candidates(election.candidates());

      if (params.candidateId) {
        var candidate = Candidate.find(params.candidateId)
        this.rankedCandidates.hide();
        this.candidateDetails.show();
        this.currentConsensus.selectedCandidate(candidate);
        this.candidateDetails.candidate(candidate);
      } else {
        var rankings = Ranking.where({electionId: params.electionId, userId: params.voterId || Application.currentUserId()});
        this.rankedCandidates.show();
        this.candidateDetails.hide();
        this.rankedCandidates.rankings(rankings);
      }
    },

    election: {
      change: function(election) {
        this.body.bindText(election, 'body');
      }
    }
  }
});
