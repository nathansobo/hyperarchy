//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

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

  mixpanelNote: function() {
    return this.answer().body();
  }
});
