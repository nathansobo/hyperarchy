_.constructor("Ranking", Model.Record, {
  constructorProperties: {
    initialize: function() {
      this.columns({
        candidateId: 'key',
        questionId: 'key',
        voteId: 'key',
        userId: 'key',
        position: 'float'
      });

      this.defaultOrderBy('position desc');

      this.belongsTo('candidate');
      this.belongsTo('question');
      this.belongsTo('user');
    },

    createOrUpdate: function(user, candidate, position) {
      var future = new Monarch.Http.AjaxFuture();

      $.ajax({
        type: 'post',
        url: '/rankings',
        dataType: 'data+records',
        data: {
          user_id: user.id(),
          question_id: candidate.questionId(),
          candidate_id: candidate.id(),
          position: position
        },
        success: function(data) {
          future.triggerSuccess(Ranking.find(data.ranking_id));
        }
      });

      return future;
    }
  }
});
