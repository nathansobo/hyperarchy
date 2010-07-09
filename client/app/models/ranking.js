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
      var newPositionFieldValue = { position: this.determinePosition(user, predecessor, successor, belowSeparator) };
      var otherFieldValues = {userId: user.id(), electionId: election.id(), candidateId: candidate.id()};

      var existingRanking = Ranking.find(otherFieldValues);
      if (existingRanking) {
        return existingRanking.update(newPositionFieldValue);
      } else {
        return this.create(_.extend(otherFieldValues, newPositionFieldValue));
      }
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
