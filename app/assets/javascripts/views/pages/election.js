_.constructor('Views.Pages.Election', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "election"}, function() {
      div({id: "headline"}, function() {
        a({'class': "new button"}, "Add An Answer")
          .ref('newCandidateLink')
          .click('routeToNewElectionForm');
        div({'class': "body"}).ref('body');
        textarea({name: "body", 'class': "body"}).ref("editableBody");
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

  column1: function() { with(this.builder) {
    div({'class': 'details'}).ref('details');
    textarea({name: 'details', 'class': "details"}).ref("editableDetails");

    a({'class': 'update button'}, "Save").ref('updateLink').click('save');
    a({'class': 'cancel button'}, "Cancel").ref('cancelEditLink').click('cancelEdit');
    a({'class': "edit button"}, "Edit").ref('editLink').click('edit');

    div({'class': 'creator'}, function() {
      subview('avatar', Views.Components.Avatar, {imageSize: 34});
      div({'class': 'name'}).ref('creatorName');
      div({'class': 'date'}).ref('createdAt');
    });

    subview('comments', Views.Pages.Election.Comments);
  }},

  column2: function() { with(this.builder) {
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
    initialize: function() {
      this.editableBody.bind('elastic', this.hitch('adjustColumnTop'));
    },

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

      if (params.candidateId === 'new') {
        this.newCandidateLink.hide();
      } else {
        this.newCandidateLink.show();
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
      this.comments.comments(election.comments());

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

        this.body.bindText(election, 'body');
        this.details.bindText(election, 'details');
        this.comments.comments(election.comments());
        this.avatar.user(election.creator());
        this.creatorName.bindText(election.creator(), 'fullName');
        this.createdAt.text(election.formattedCreatedAt());
        this.cancelEdit();

        if (this.electionUpdateSubscription) this.electionUpdateSubscription.destroy();
        this.electionUpdateSubscription = election.onUpdate(this.hitch('handleElectionUpdate'));
        this.handleElectionUpdate();
      }
    },

    edit: function() {
      this.body.hide();
      this.details.hide();
      this.editLink.hide();
      this.editableBody.show();
      this.editableBody.focus();
      this.editableDetails.show();
      this.editableBody.val(this.election().body()).elastic();
      this.editableDetails.val(this.election().details()).elastic();
      this.updateLink.show();
      this.cancelEditLink.show();
      this.adjustColumnTop();
    },

    cancelEdit: function() {
      this.body.show();
      this.showOrHideDetails();
      this.editLink.show();
      this.editableBody.hide();
      this.editableDetails.hide();
      this.updateLink.hide();
      this.cancelEditLink.hide();
      this.adjustColumnTop();
    },

    save: function(e) {
      e.preventDefault();
      this.election().update({body: this.editableBody.val(), details: this.editableDetails.val()}).success(this.hitch('cancelEdit'));
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

    handleElectionUpdate: function() {
      this.adjustColumnTop();
      this.showOrHideDetails();
    },

    showOrHideDetails: function() {
      if (this.election().details()) {
        this.details.show()
      } else {
        this.details.hide()
      }
    },

    routeToNewElectionForm: function() {
      History.pushState(null, null, this.election().newCandidateUrl());
    },

    distanceFromHeadline: function() {
      return Application.lineHeight * 2;
    },
    
    adjustColumnTop: function() {
      var bigLineHeight = Application.lineHeight * 1.5;
      var quantizedHeadlineHeight = Math.round(this.headline.height() / bigLineHeight) * bigLineHeight;
      this.columns.css('top', quantizedHeadlineHeight + this.distanceFromHeadline());
    }
  }
});
