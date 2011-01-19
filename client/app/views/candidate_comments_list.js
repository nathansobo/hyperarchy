_.constructor("Views.CandidateCommentsList", View.Template, {
  content: function() { with(this.builder) {
    div(function() {
      label("Comments").ref('commentsLabel');
      subview('candidateCommentsList', Views.SortedList, {
        rootAttributes: {'class': "candidateCommentsList nonEditable"},
        buildElement: function(candidateComment) {
          return Views.CandidateCommentLi.toView({candidateComment: candidateComment});
        }
      });
    });
  }},
  
  viewProperties: {
    initialize: function() {
      this.candidateCommentsList.onInsert = this.hitch('commentInserted');
      this.candidateCommentsList.onRemove = this.hitch('commentRemoved');
    },

    candidate: {
      afterChange: function(candidate) {
        this.candidateCommentsList.relation(candidate.comments());
        if (this.candidate().comments().empty()) {
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
      if (this.candidate().comments().empty()) this.hideList();
    },

    hideList: function() {
      this.commentsLabel.hide();
      this.candidateCommentsList.hide();
    },

    showList: function() {
      this.commentsLabel.show();
      this.candidateCommentsList.show();
    }
  }
});
