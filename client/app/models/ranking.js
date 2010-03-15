constructor("Ranking", Model.Record, {


  constructorProperties: {
    initialize: function() {
      this.columns({
        candidateId: 'key',
        electionId: 'key',
        userId: 'key',
        position: 'float'
      });
    },

    createOrUpdate: function(user, election, candidate, predecessor, successor) {
      var positions = this.determinePredecessorAndSuccessorPositions(user, election, predecessor, successor);
      
      return this.create({
        userId: user.id(),
        electionId: election.id(),
        candidateId: candidate.id(),
        position: (positions.predecessor + positions.successor) / 2
      });
    },

    // private

    determinePredecessorAndSuccessorPositions: function(user, election, predecessor, successor) {
      var positions = {};

      if (predecessor) {
        positions.predecessor = user.rankings().find({ candidateId: predecessor.id() }).position();
      } else {
        positions.predecessor = 0;
      }

      if (successor) {
        positions.successor = user.rankings().find({ candidateId: successor.id() }).position();
      } else {
        var lastRanking = user.rankings().where({ electionId: election.id()}).last();
        if (lastRanking) {
          positions.successor = lastRanking.position() + 2;
        } else {
          positions.successor = 2;
        }
      }

      return positions;
    }
  }

});
