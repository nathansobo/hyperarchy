_.constructor("Views.CandidateCommentLi", View.Template, {
  content: function(params) {with(this.builder) {
    var candidateComment = params.candidateComment;
    li({candidateCommentId: candidateComment.id(), 'class': "candidateComment"}, function() {
      div({'class': "commentBody"}, candidateComment.body());

      div({'class': "commentCreator"}, function() {
        raw("&mdash;")
        text(candidateComment.creator().fullName());
      });
      div({'class': "commentCreatedAt"}, candidateComment.formattedCreatedAt());
      div({'class': "clear"});
    });
  }}
});