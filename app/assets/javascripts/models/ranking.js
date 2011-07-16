_.constructor("Ranking", Model.Record, {
  constructorProperties: {
    initialize: function() {
      this.columns({
        answerId: 'key',
        questionId: 'key',
        voteId: 'key',
        userId: 'key',
        position: 'float'
      });

      this.defaultOrderBy('position desc');

      this.belongsTo('answer');
      this.belongsTo('question');
      this.belongsTo('user');
    },

    createOrUpdate: function(user, answer, position) {
      var future = new Monarch.Http.AjaxFuture();

      $.ajax({
        type: 'post',
        url: '/rankings',
        dataType: 'data+records',
        data: {
          user_id: user.id(),
          question_id: answer.questionId(),
          answer_id: answer.id(),
          position: position
        },
        success: function(data) {
          future.triggerSuccess(Ranking.find(data.ranking_id));
        }
      });

      return future;
    }
  },

  trackCreate: function() {
    mpq.push(['track', "Create Ranking", {
      mp_note: this.answer().body(),
      answer: this.answer(),
      answerId: this.answerId(),
      user: this.user().fullName(),
      userId: this.userId()
    }]);
  },

  trackUpdate: function() {
    mpq.push(['track', "Update Ranking", {
      mp_note: this.answer().body(),
      answer: this.answer(),
      answerId: this.answerId(),
      user: this.user().fullName(),
      userId: this.userId()
    }]);
  }
});
