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

    createOrUpdate: function(user, election, candidate, predecessor, successor) {
      var positions = this.determinePredecessorAndSuccessorPositions(user, election, predecessor, successor);
      var newPositionFieldValue = { position: (positions.predecessor + positions.successor) / 2 };
      var otherFieldValues = {userId: user.id(), electionId: election.id(), candidateId: candidate.id()};

      var existingRanking = Ranking.find(otherFieldValues);
      if (existingRanking) {
        return existingRanking.update(newPositionFieldValue);
      } else {
        return this.create(_.extend(otherFieldValues, newPositionFieldValue));
      }
    },

    // private

    determinePredecessorAndSuccessorPositions: function(user, election, predecessor, successor) {
      var positions = {};
      var predecessorPosition = predecessor ? user.rankings().find({ candidateId: predecessor.id() }).position() : null;
      var successorPosition = successor ? user.rankings().find({ candidateId: successor.id() }).position() : null;

      if (predecessorPosition) {
        positions.predecessor = predecessorPosition;
      } else {
        if (successorPosition) {
          positions.predecessor = successorPosition + 128;
        } else {
          positions.predecessor = 128;
        }
      }

      if (successorPosition) {
        positions.successor = successorPosition;
      } else {
        positions.successor = 0;
      }

      return positions;
    }
  }

});
