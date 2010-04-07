_.constructor("Election", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      organizationId: 'key',
      body: 'string'
    });

    this.hasMany('candidates');
    this.hasMany('rankings', {orderBy: 'position'});
  },

  afterInitialize: function() {
    this.rankingsByUserId = {}
    this.rankedCandidatesByUserId = {}
    this.unrankedCandidatesByUserId = {}
  },

  rankingsForUser: function(user) {
    var userId = user.id();
    if (this.rankingsByUserId[userId]) return this.rankingsByUserId[userId];
    return this.rankingsByUserId[userId] = this.rankings().where({userId: userId})
  },

  rankedCandidatesForUser: function(user) {
    var userId = user.id();
    if (this.rankedCandidatesByUserId[userId]) return this.rankedCandidatesByUserId[userId];
    return this.rankedCandidatesByUserId[userId] = this.rankingsForUser(user).joinThrough(Candidate);
  },

  unrankedCandidatesForUser: function(user) {
    var userId = user.id();
    if (this.unrankedCandidatesByUserId[userId]) return this.unrankedCandidatesByUserId[userId];
    return this.unrankedCandidatesByUserId[userId] = this.candidates().difference(this.rankedCandidatesForUser(user));
  }
});
