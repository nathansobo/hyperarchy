_.constructor("Election", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      organizationId: 'key',
      creatorId: 'key',
      body: 'string',
      voteCount: 'integer',
      updatedAt: 'datetime'
    });

    this.hasMany('candidates', {orderBy: 'position asc'});
    this.hasMany('rankings', {orderBy: 'position desc'});

    this.belongsTo('organization');
    this.belongsTo('creator', {constructorName: 'User'});
  },

  afterInitialize: function() {
    this.rankingsByUserId = {};
    this.rankedCandidatesByUserId = {};
    this.unrankedCandidatesByUserId = {};
  },

  rankingsForUser: function(user) {
    var userId = user.id();
    if (this.rankingsByUserId[userId]) return this.rankingsByUserId[userId];
    return this.rankingsByUserId[userId] = this.rankings().where({userId: userId})
  },

  rankingsForCurrentUser: function() {
    return this.rankingsForUser(Application.currentUser());
  },

  rankedCandidatesForUser: function(user) {
    var userId = user.id();
    if (this.rankedCandidatesByUserId[userId]) return this.rankedCandidatesByUserId[userId];
    return this.rankedCandidatesByUserId[userId] = this.rankingsForUser(user).joinThrough(Candidate);
  },

  belongsToCurrentUser: function() {
    return this.creator() === Application.currentUser();
  },

  unrankedCandidatesForUser: function(user) {
    var userId = user.id();
    if (this.unrankedCandidatesByUserId[userId]) return this.unrankedCandidatesByUserId[userId];
    return this.unrankedCandidatesByUserId[userId] = this.candidates().difference(this.rankedCandidatesForUser(user));
  }
});
