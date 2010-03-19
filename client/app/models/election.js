constructor("Election", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      organizationId: 'key',
      body: 'string'
    });

    this.hasMany('candidates');
    this.hasMany('rankings', {orderBy: 'position'}).extend({
      forUser: function(user) {
        var userId = user.id();
        if (!this.rankingsByUserId) this.rankingsByUserId = {}
        if (!this.rankingsByUserId[userId]) this.rankingsByUserId[userId] = this.where({userId: userId});
        return this.rankingsByUserId[userId];
      }
    });

    this.relatesToMany('rankedCandidates', function() {
      return this.rankings().joinThrough(Candidate);
    });

    this.relatesToMany('unrankedCandidates', function() {
      return this.candidates().difference(this.rankedCandidates());
    });
  }
});
