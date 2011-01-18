_.constructor("Views.CandidateCommentLi", View.Template, {
  content: function(params) {with(this.builder) {
    var candidateComment = params.candidateComment;
    li({candidateCommentId: candidateComment.id(), 'class': "candidateComment"}, function() {
      div({'class': "commentBody"}, candidateComment.body());
      div({'class': "commentCreator"}, "-- " + candidateComment.creator().fullName());
      div({'class': "clear"});
    });
  }}
});