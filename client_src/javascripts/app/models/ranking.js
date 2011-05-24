_.constructor("Ranking", Model.Record, {
  constructorProperties: {
    initialize: function() {
      this.columns({
        candidateId: 'key',
        electionId: 'key',
        voteId: 'key',
        userId: 'key',
        position: 'float'
      });

      this.belongsTo('candidate');
      this.belongsTo('election');
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
          election_id: candidate.electionId(),
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
