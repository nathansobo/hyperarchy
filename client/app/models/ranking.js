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

    createOrUpdate: function(user, election, candidate, predecessor, successor, belowSeparator) {
      var future = new Monarch.Http.AjaxFuture();

      Server.post("/rankings", {
        user_id: user.id(),
        election_id: election.id(),
        candidate_id: candidate.id(),
        position: this.determinePosition(user, predecessor, successor, belowSeparator)
      }).onSuccess(function(data) {
        future.triggerSuccess(Ranking.find(data.ranking_id));
      });

      return future;
    },

    // private

    determinePosition: function(user, predecessor, successor, belowSeparator) {
      var predecessorPosition = predecessor ? user.rankings().find({ candidateId: predecessor.id() }).position() : null;
      var successorPosition = successor ? user.rankings().find({ candidateId: successor.id() }).position() : null;

      if (belowSeparator) {
        if (!successorPosition) successorPosition = 0;
        if (!predecessorPosition) predecessorPosition = successorPosition - 128;
      } else {
        if (!predecessorPosition) predecessorPosition = 0;
        if (!successorPosition) successorPosition = predecessorPosition + 128;
      }
      
      return (predecessorPosition + successorPosition) / 2;
    }
  }
});
