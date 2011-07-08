_.constructor('Views.Pages.Question', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "question"}, function() {
      div({id: "subheader"}, function() {
        a({href: "javascript:void"}, "Back to Questions").ref('organizationLink').click(function() {
          History.pushState(null, null, this.question().organization().url());
          return false;
        });
      });

      div({id: "headline"}, function() {
        a({'class': "new button"}, "Add An Answer")
          .ref('newCandidateLink')
          .click('routeToNewQuestionForm');
        div({'class': "body"}).ref('body');
        textarea({name: "body", 'class': "body"}).ref("editableBody");
        subview('charsRemaining', Views.Components.CharsRemaining, { limit: 140 });
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

      subview('spinner', Views.Components.Spinner);
    });
  }},

  column1: function() { with(this.builder) {
    div({'class': 'details'}).ref('details');
    textarea({name: 'details', 'class': "details"}).ref("editableDetails");

    a({'class': 'update button'}, "Save").ref('updateButton').click('update');
    a({'class': 'cancel button'}, "Cancel").ref('cancelEditButton').click('cancelEdit');
    a({'class': "destroy button"}, "Delete").ref('destroyButton').click('destroy');
    a({'class': "edit button"}, "Edit").ref('editButton').click('edit');

    div({'class': 'creator'}, function() {
      subview('avatar', Views.Components.Avatar, {imageSize: 34});
      div({'class': 'name'}).ref('creatorName');
      div({'class': 'date'}).ref('createdAt');
    }).ref('creator');

    subview('comments', Views.Pages.Question.Comments);
  }},

  column2: function() { with(this.builder) {
    h2("Current Consensus");
    subview('currentConsensus', Views.Pages.Question.CurrentConsensus);
  }},

  column3: function() { with(this.builder) {
    h2("Your Ranking").ref('rankedCandidatesHeader');
    h2("Answer Details").ref('candidateDetailsHeader');

    div({id: "rankings-and-details"}, function() {
      subview('candidateDetails', Views.Pages.Question.CandidateDetails);
      subview('rankedCandidates', Views.Pages.Question.RankedCandidates);
    });
  }},

  column4: function() {
    this.builder.subview('votes', Views.Pages.Question.Votes);
  },

  viewProperties: {
    fixedHeight: true,

    attach: function($super) {
      $super();

      this.charsRemaining.field(this.editableBody);
      this.editableBody.elastic();
      this.editableDetails.elastic();
      this.editableBody.bind('elastic', this.hitch('adjustColumnTop'));
      this.editableDetails.bind('elastic', this.hitch('adjustCommentsHeight'));
      $(window).resize(this.hitch('adjustCommentsHeight'));

      Application.onCurrentUserChange(function(currentUser) {
        if (this.question()) {
          this.showOrHideMutateButtons();
        }

        var params = this.params();
        if (params) {
          return currentUser
            .rankings()
            .where({questionId: params.questionId})
            .fetch()
            .success(this.hitch('populateContentAfterFetch', params));
        }
      }, this);
    },

    beforeShow: function() {
      Application.addClass('fixed-height');
    },

    afterHide: function() {
      Application.removeClass('fixed-height');
    },

    params: {
      change: function(params, oldParams) {
        this.populateContentBeforeFetch(params);
        return this.fetchData(params, oldParams)
          .success(this.hitch('populateContentAfterFetch', params));
      }
    },

    populateContentBeforeFetch: function(params) {
      var question = Question.find(params.questionId);
      if (question) {
        this.question(question);
        this.currentConsensus.candidates(question.candidates());
      } else {
        this.loading(true);
      }

      var voterId;

      if (params.candidateId) {
        this.showCandidateDetails();
        var candidate = Candidate.find(params.candidateId);
        if (candidate) {
          this.currentConsensus.selectedCandidate(candidate);
          this.candidateDetails.candidate(candidate);
        }
      } else {
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

      if (!oldParams || params.questionId !== oldParams.questionId) {
        if (!Question.find(params.questionId)) relationsToFetch.push(Question.where({id: params.questionId}).join(User).on(User.id.eq(Question.creatorId))); // question
        relationsToFetch.push(Candidate.where({questionId: params.questionId}).join(User).on(Candidate.creatorId.eq(User.id))); // candidates
        relationsToFetch.push(Vote.where({questionId: params.questionId}).joinTo(User)); // votes
        relationsToFetch.push(Application.currentUser().rankings().where({questionId: params.questionId})); // current user's rankings
        relationsToFetch.push(QuestionComment.where({questionId: params.questionId}).join(User).on(QuestionComment.creatorId.eq(User.id))); // question comments and commenters

        this.comments.loading(true);
        this.votes.loading(true);
      }

      if (params.voterId) {
        relationsToFetch.push(Ranking.where({questionId: params.questionId, userId: params.voterId})); // additional rankings
      }

      if (params.candidateId && params.candidateId !== "new") {
        relationsToFetch.push(CandidateComment.where({candidateId: params.candidateId}).join(User).on(CandidateComment.creatorId.eq(User.id))); // candidate comments and commenters
        this.candidateDetails.loading(true);
      } else {
        this.rankedCandidates.loading(true);
      }

      return Server.fetch(relationsToFetch);
    },

    populateContentAfterFetch: function(params) {
      if (!_.isEqual(params, this.params())) return;

      this.loading(false);
      this.rankedCandidates.loading(false);
      this.candidateDetails.loading(false);
      this.votes.loading(false);
      this.comments.loading(false);

      var question = Question.find(params.questionId);

      if (!question) {
        History.pushState(null, null, Application.currentUser().defaultOrganization().url());
        return;
      }

      this.question(question);
      this.currentConsensus.candidates(question.candidates());
      this.votes.votes(question.votes());
      this.comments.comments(question.comments());

      if (params.candidateId) {
        var candidate = Candidate.find(params.candidateId);
        this.currentConsensus.selectedCandidate(candidate);
        this.candidateDetails.candidate(candidate);
        if (candidate) this.candidateDetails.comments.comments(candidate.comments());
        if (params.candidateId === 'new') this.candidateDetails.showNewForm();
      } else {
        var rankings = Ranking.where({questionId: params.questionId, userId: params.voterId || Application.currentUserId()});
        this.showRankedCandidates();
        this.populateRankedCandidatesHeader(params.voterId);
        this.rankedCandidates.rankings(rankings);
      }
    },

    question: {
      change: function(question) {
        this.avatar.user(question.creator());
        this.body.bindText(question, 'body');
        Application.currentOrganizationId(question.organizationId());

        this.body.bindText(question, 'body');
        this.details.bindText(question, 'details');
        this.comments.comments(question.comments());
        this.avatar.user(question.creator());
        this.creatorName.bindText(question.creator(), 'fullName');
        this.createdAt.text(question.formattedCreatedAt());

        this.showOrHideMutateButtons();
        this.cancelEdit();


        if (this.questionUpdateSubscription) this.questionUpdateSubscription.destroy();
        this.questionUpdateSubscription = question.onUpdate(this.hitch('handleQuestionUpdate'));
        this.handleQuestionUpdate();

        this.registerInterest(question, 'onDestroy', this.bind(function() {
          if (this.is(':visible')) History.pushState(null, null, Application.currentOrganization().url());
        }));

        this.adjustCommentsHeight();
      }
    },

    edit: function() {
      this.addClass('edit-mode');
      this.editableBody.focus();
      this.editableBody.val(this.question().body()).keyup();
      this.editableDetails.val(this.question().details()).keyup();
      this.adjustColumnTop();
    },

    cancelEdit: function() {
      this.removeClass('edit-mode');
      this.showOrHideDetails();
      this.adjustColumnTop();
    },

    update: function(e) {
      e.preventDefault();
      if ($.trim(this.editableBody.val()) === "") return false;
      if (this.editableBody.val().length > 140) return false;
      this.question().update({body: this.editableBody.val(), details: this.editableDetails.val()}).success(this.hitch('cancelEdit'));
    },

    destroy: function() {
      if (window.confirm("Are you sure you want to delete this question? It can't be undone.")) {
        this.question().destroy();
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

    handleQuestionUpdate: function() {
      this.showOrHideDetails();
      this.adjustColumnTop();
    },

    showOrHideDetails: function() {
      if (this.question().details()) {
        this.details.show()
      } else {
        this.details.hide()
      }
    },

    routeToNewQuestionForm: function() {
      History.pushState(null, null, this.question().newCandidateUrl());
    },

    adjustColumnTop: function() {
      this.columns.css('top', this.columnTopPosition());
      this.adjustCommentsHeight();
    },

    columnTopPosition: function() {
      var bigLineHeight = Application.lineHeight * 1.5;

      var distanceFromHeadline = Application.lineHeight * 2;
      var subheaderHeight = this.headline.position().top;
      var quantizedHeadlineHeight = Math.round(this.headline.height() / bigLineHeight) * bigLineHeight;

      return Math.round(quantizedHeadlineHeight + distanceFromHeadline + subheaderHeight);
    },

    adjustCommentsHeight: function() {
      this.comments.fillVerticalSpace(this.columns);
      this.comments.adjustHeightAndScroll();
    },

    showOrHideMutateButtons: function() {
      if (this.question().editableByCurrentUser()) {
        this.addClass('mutable');
      } else {
        this.removeClass('mutable');
      }
    },

    loading: {
      change: function(loading) {
        if (loading) {
          this.headline.hide();
          this.columns.hide();
          this.spinner.show();
        } else {
          this.headline.show();
          this.columns.show();
          this.spinner.hide();
        }
      }
    }
  }
});
