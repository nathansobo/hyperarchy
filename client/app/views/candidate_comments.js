_.constructor("Views.CandidateComments", View.Template, {
  content: function() { with(this.builder) {
    div(function() {
      label("Comments").ref('commentsLabel');
      div({'class': "commentsContainer"}, function() {
        subview('candidateCommentsList', Views.SortedList, {
          rootAttributes: {'class': "commentsList nonEditable" },
          buildElement: function(candidateComment) {
            return Views.CandidateCommentLi.toView({candidateComment: candidateComment});
          }
        });

        div({'class': "createCommentForm"}, function() {
          textarea().ref('createCommentTextarea');
          div({'class': "clear"});

          button({'class': "createCommentButton"}, "Make a Comment")
            .ref('createCommentButton')
            .click('createComment');

          div({'class': "loading", style: "display: none;"}).ref("createCommentSpinner");
          div({'class': "clear"});
        }).ref('createCommentForm');
      });
    });
  }},

  viewProperties: {
    initialize: function() {
      this.candidateCommentsList.onInsert = this.hitch('commentInserted');
      this.candidateCommentsList.onRemove = this.hitch('commentRemoved');

      this.defer(function() {
        this.createCommentTextarea.elastic();
      });
    },

    candidate: {
      afterChange: function(candidate) {
        this.candidateCommentsList.relation(candidate.candidateComments());
        if (this.candidate().candidateComments().empty()) {
          this.hideList();
        } else {
          this.showList();
        }
      }
    },

    afterRemove: function() {
      this.candidateCommentsList.remove();
    },

    commentInserted: function() {
      this.showList();
    },

    commentRemoved: function() {
      if (this.candidate().candidateComments().empty()) this.hideList();
    },

    hideList: function() {
      this.commentsLabel.hide();
      this.candidateCommentsList.hide();
    },

    showList: function() {
      this.commentsLabel.show();
      this.candidateCommentsList.show();
    },

    createComment: function(elt, e) {
      this.createCommentTextarea.blur();
      e.preventDefault();
      if (this.commentCreationDisabled) return;

      var body = this.createCommentTextarea.val();
      if (body === "") return;
      this.createCommentTextarea.val("");
      this.createCommentTextarea.keyup();
      this.commentCreationDisabled = true;

      this.createCommentSpinner.show();
      this.candidate().candidateComments().create({body: body})
        .onSuccess(function() {
          this.createCommentSpinner.hide();
          this.commentCreationDisabled = false;
        }, this);
    }
  }
});
