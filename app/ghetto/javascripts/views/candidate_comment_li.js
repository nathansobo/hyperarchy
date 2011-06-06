_.constructor("Views.CandidateCommentLi", View.Template, {
  content: function(params) {with(this.builder) {
    var candidateComment = params.candidateComment;
    li({candidateCommentId: candidateComment.id(), 'class': "candidateComment"}, function() {
      div({'class': "commentHeader"}, function() {
        div({'class': "commentCreator"}).ref('commentCreator');
        div({'class': "commentCreatedAt"}, candidateComment.formattedCreatedAt());
      });
      div({'class': "commentBody"}, function() {
        raw(htmlEscape(candidateComment.body(), true));
      });
    });
  }},

  viewProperties: {
    initialize: function() {
      this.hide();
      User.findOrFetch(this.candidateComment.creatorId())
        .onSuccess(function(creator) {
          this.commentCreator.html(htmlEscape(creator.fullName()));
          this.show();  
        }, this);
    }
  }

});