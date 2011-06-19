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
        div({id: 'column-3'}, function() {
          h2("Your Ranking").ref('rankedCandidatesHeader');
          h2("Answer Details").ref('candidateDetailsHeader');

          div({'class': "inset"}, function() {
            subview('candidateDetails', Views.Pages.Election.CandidateDetails);
            subview('rankedCandidates', Views.Pages.Election.RankedCandidates);
          });
        });
        div({id: "votes-column"}, function() {
          subview('votes', Views.Pages.Election.Votes);
        });
      }).ref('columns');
    });
  }},

  viewProperties: {

    params: {
      change: function(params, oldParams) {
        this.populateContentBeforeFetch(params);
        return this.fetchData(params, oldParams)
          .success(this.hitch('populateContentAfterFetch', params));
      }
    },

    populateContentBeforeFetch: function(params) {
      var election = Election.find(params.electionId);
      if (election) this.election(election);

      var voterId;
      if (!params.candidateId) {
        this.candidateDetails.removeClass('active');
        this.currentConsensus.selectedCandidate(null);
        voterId = params.voterId || Application.currentUserId();
        this.rankedCandidates.sortingEnabled(!voterId || voterId === Application.currentUserId());
        this.populateRankedCandidatesHeader(voterId);
      }

      this.votes.selectedVoterId(voterId);
    },

    fetchData: function(params, oldParams) {
      var relationsToFetch = [];

      if (!oldParams || params.electionId !== oldParams.electionId) {
        if (!Election.find(params.electionId)) relationsToFetch.push(Election.where({id: params.electionId})); // election
        relationsToFetch.push(Candidate.where({electionId: params.electionId})); // candidates
        relationsToFetch.push(Vote.where({electionId: params.electionId}).joinTo(User)); // votes
        relationsToFetch.push(Application.currentUser().rankings().where({electionId: params.electionId})); // current user's rankings
      }

      if (params.voterId) {
        relationsToFetch.push(Ranking.where({electionId: params.electionId, userId: params.voterId})); // additional rankings
      }

      return Server.fetch(relationsToFetch);
    },

    populateContentAfterFetch: function(params) {
      var election = Election.find(params.electionId);

      if (!election) {
        History.pushState(null, null, Application.currentUser().defaultOrganization().url());
        return;
      }

      this.election(election);
      this.currentConsensus.candidates(election.candidates());
      this.votes.votes(election.votes());

      if (params.candidateId) {
        var candidate = Candidate.find(params.candidateId)
        this.currentConsensus.selectedCandidate(candidate);
        this.showCandidateDetails();
        this.candidateDetails.candidate(candidate);
      } else {
        var rankings = Ranking.where({electionId: params.electionId, userId: params.voterId || Application.currentUserId()});
        this.showRankedCandidates();
        this.populateRankedCandidatesHeader(params.voterId);
        this.rankedCandidates.rankings(rankings);
      }
    },

    populateRankedCandidatesHeader: function(voterId) {
      if (!voterId || voterId === Application.currentUserId()) {
        this.rankedCandidatesHeader.text('Your Ranking');
        return;
      }

      var voter = User.find(voterId);
      if (voter) this.rankedCandidatesHeader.text(voter.fullName() + "'s Ranking");
    },

    election: {
      change: function(election) {
        this.body.bindText(election, 'body');
      }
    },

    showRankedCandidates: function() {
      this.candidateDetailsHeader.hide();
      this.rankedCandidatesHeader.show();
      this.candidateDetails.removeClass('active');
    },

    showCandidateDetails: function() {
      this.rankedCandidatesHeader.hide();
      this.candidateDetailsHeader.show();
      this.candidateDetails.addClass('active');
    }
  }
});
