_.constructor("Views.CandidateCommentLi", View.Template, {
  content: function(params) {with(this.builder) {
    var candidateComment = params.candidateComment;
    li({candidateCommentId: candidateComment.id(), 'class': "candidateComment"}, function() {
      div({'class': "loading", style: "display: none;"}).ref('loadingIcon');
      div({'class': "body"}, candidateComment.body());
    });
  }},

  viewProperties: {
    startLoading: function() {
      this.loadingIcon.show();
    },

    stopLoading: function() {
      this.loadingIcon.hide();
    }
  }
});