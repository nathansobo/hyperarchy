_.constructor('Views.Pages.Election', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "election"}, function() {

      div({id: "headline"}, function() {
        subview('avatar', Views.Components.Avatar, {imageSize: 19 * 1.5 * 3 });
        div({'class': "body"}).ref('body');
        div({'class': "clearfix"});
      }).ref('headline');

      div({id: "columns"}, function() {
        div(function() {
          for (var i = 1; i <= 4; i++) {
            div({'class': "column", id: "column" + i}, function() {
              div(function() {
                div({style: "height: 0"}, function() { raw("&nbsp;") }); // hack to allow textareas first
                template['column' + i]();
              });
            });
          }
        });
      }).ref('columns');
    });
  }},

  column1: function() {
    this.builder.subview('electionDetails', Views.Pages.Election.ElectionDetails);
  },

  column2: function() { with(this.builder) {
    a({'class': "link"}, "Add An Answer")
      .ref('newCandidateButton')
      .click('routeToNewElectionForm');
    h2("Current Consensus");
    subview('currentConsensus', Views.Pages.Election.CurrentConsensus);
  }},

  column3: function() { with(this.builder) {
    h2("Your Ranking").ref('rankedCandidatesHeader');
    h2("Answer Details").ref('candidateDetailsHeader');

    div({id: "rankings-and-details"}, function() {
      subview('candidateDetails', Views.Pages.Election.CandidateDetails);
      subview('rankedCandidates', Views.Pages.Election.RankedCandidates);
    });
  }},

  column4: function() {
    this.builder.subview('votes', Views.Pages.Election.Votes);
  },

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
        relationsToFetch.push(Candidate.where({electionId: params.electionId}).join(User).on(Candidate.creatorId.eq(User.id))); // candidates
        relationsToFetch.push(Vote.where({electionId: params.electionId}).joinTo(User)); // votes
        relationsToFetch.push(Application.currentUser().rankings().where({electionId: params.electionId})); // current user's rankings
        relationsToFetch.push(ElectionComment.where({electionId: params.electionId}).join(User).on(ElectionComment.creatorId.eq(User.id))); // election comments
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
        var candidate = Candidate.find(params.candidateId);
        this.currentConsensus.selectedCandidate(candidate);
        this.candidateDetails.candidate(candidate);
        this.showCandidateDetails();
        if (params.candidateId === 'new') this.candidateDetails.showNewForm();
      } else {
        var rankings = Ranking.where({electionId: params.electionId, userId: params.voterId || Application.currentUserId()});
        this.showRankedCandidates();
        this.populateRankedCandidatesHeader(params.voterId);
        this.rankedCandidates.rankings(rankings);
      }
    },

    election: {
      change: function(election) {
        this.avatar.user(election.creator());
        this.body.bindText(election, 'body');
        Application.currentOrganizationId(election.organizationId());
        this.electionDetails.election(election);
        this.adjustColumnTop();

        if (this.electionUpdateSubscription) this.electionUpdateSubscription.destroy();
        this.electionUpdateSubscription = election.onUpdate(this.hitch('adjustColumnTop'));
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

    showRankedCandidates: function() {
      this.candidateDetailsHeader.hide();
      this.rankedCandidatesHeader.show();
      this.candidateDetails.removeClass('active');
    },

    showCandidateDetails: function() {
      this.rankedCandidatesHeader.hide();
      this.candidateDetailsHeader.show();
      this.candidateDetails.addClass('active');
    },

    routeToNewElectionForm: function() {
      History.pushState(null, null, this.election().newCandidateUrl());
    },

    adjustColumnTop: function() {
      this.columns.css('top', Application.lineHeight * 2 + this.headline.height());
    }
  }
});
