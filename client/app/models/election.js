_.constructor("Election", Model.Record, {
  constructorProperties: {
    initialize: function() {
      this.columns({
        organizationId: 'key',
        creatorId: 'key',
        body: 'string',
        voteCount: 'integer',
        score: 'float',
        updatedAt: 'datetime',
        createdAt: 'datetime'
      });

      this.defaultOrderBy('score desc');

      this.hasMany('candidates', {orderBy: 'position asc'});
      this.hasMany('votes', {orderBy: 'updatedAt desc'});
      this.hasMany('electionVisits');
      this.relatesToMany('voters', function() {
        return this.votes().joinThrough(User);
      });

      this.hasMany('rankings', {orderBy: 'position desc'});

      this.belongsTo('organization');
      this.belongsTo('creator', {constructorName: 'User'});
    },

    scoreUpdateInterval: 60000,

    updateScoresPeriodically: function() {
      setInterval(this.hitch('updateScores'), this.scoreUpdateInterval);
    },

    updateScores: function() {
      var queue = new Monarch.Queue(10);
      this.each(function(election) {
        queue.add(function() {
          election.updateScore();
        });
      });
      queue.start();
    }
  },

  afterInitialize: function() {
    this.rankingsByUserId = {};
    this.rankedCandidatesByUserId = {};
    this.unrankedCandidatesByUserId = {};
  },

  rankingsForUser: function(user) {
    var userId = user.id();
    if (this.rankingsByUserId[userId]) return this.rankingsByUserId[userId];
    return this.rankingsByUserId[userId] = this.rankings().where({userId: userId}).orderBy(Ranking.position.desc());
  },

  rankingsForCurrentUser: function() {
    return this.rankingsForUser(Application.currentUser());
  },

  rankedCandidatesForUser: function(user) {
    var userId = user.id();
    if (this.rankedCandidatesByUserId[userId]) return this.rankedCandidatesByUserId[userId];
    return this.rankedCandidatesByUserId[userId] = this.rankingsForUser(user).joinThrough(Candidate);
  },

  editableByCurrentUser: function() {
    return Application.currentUser().admin() || this.belongsToCurrentUser() || this.organization().currentUserIsOwner();
  },

  belongsToCurrentUser: function() {
    return this.creator() === Application.currentUser();
  },

  unrankedCandidatesForUser: function(user) {
    var userId = user.id();
    if (this.unrankedCandidatesByUserId[userId]) return this.unrankedCandidatesByUserId[userId];
    return this.unrankedCandidatesByUserId[userId] = this.candidates().difference(this.rankedCandidatesForUser(user));
  },

  currentUsersVisit: function() {
    return this.electionVisits().find({userId: Application.currentUserId});
  },

  fetchVotes: function() {
    return Server.fetch([this.votes(), this.voters()]);
  },

  formattedCreatedAt: function() {
    return $.PHPDate("M j, Y @ g:ia", this.createdAt());
  },

  updateScore: function() {
    // simulate update received from server
    this.remotelyUpdated({score: this.computeScore()});
  },

  computeScore: function() {
    return (this.voteCount() + Election.SCORE_EXTRA_HOURS) / Math.pow(this.ageInHours() + Election.SCORE_EXTRA_HOURS, Election.SCORE_GRAVITY);
  },

  ageInHours: function() {
    return (new Date().getTime() - this.createdAt().getTime()) / 3600000
  }
});