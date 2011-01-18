_.constructor("Views.CandidateCommentLi", View.Template, {
  content: function(params) {with(this.builder) {
    var candidateComment = params.candidateComment;
    li({candidateCommentId: candidateComment.id(), 'class': "candidateComment"}, function() {
      div({'class': "commentHeader"}, function() {
        div({'class': "commentCreator"}, candidateComment.creator().fullName());
        div({'class': "commentCreatedAt"}, candidateComment.formattedCreatedAt());
      });
      div({'class': "commentBody"}, candidateComment.body());
    });
  }}
});