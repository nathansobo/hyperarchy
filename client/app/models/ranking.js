_.constructor("Ranking", Model.Record, {
  constructorProperties: {
    initialize: function() {
      this.columns({
        candidateId: 'key',
        electionId: 'key',
        userId: 'key',
        position: 'float'
      });

      this.belongsTo('candidate');
      this.belongsTo('election');
      this.belongsTo('user');
    },

    createOrUpdate: function(user, candidate, position) {
      var future = new Monarch.Http.AjaxFuture();

      Server.post("/rankings", {
        user_id: user.id(),
        election_id: candidate.electionId(),
        candidate_id: candidate.id(),
        position: position
      }).onSuccess(function(data) {
        future.triggerSuccess(Ranking.find(data.ranking_id));
      });

      return future;
    }
  }
});
