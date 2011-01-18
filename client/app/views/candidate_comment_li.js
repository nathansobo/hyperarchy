_.constructor("Views.CandidateCommentLi", View.Template, {
  content: function(params) {with(this.builder) {
    var candidateComment = params.candidateComment;
    li({candidateCommentId: candidateComment.id(), 'class': "candidateComment"}, function() {
      div({'class': "loading", style: "display: none;"}).ref('loadingIcon');
      div({'class': "body"}).ref('body');
    });
  }},

  viewProperties: {
    initialize: function() {
      this.subscriptions = new Monarch.SubscriptionBundle;
      this.assignBody(this.candidate.body());
      this.subscriptions.add(this.candidateComment.onUpdate(function(changes) {
        if (changes.body) {
          this.assignBody(changes.body.newValue);
        }
      }, this));
    },

    afterRemove: function() {
      this.subscriptions.destroy();
    },

    startLoading: function() {
      this.loadingIcon.show();
    },

    stopLoading: function() {
      this.loadingIcon.hide();
    },

    assignBody: function(body) {
      this.body.html(body);
    }
  }
});