_.constructor("Candidate", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      electionId: 'key',
      creatorId: 'key',
      body: 'string',
      details: 'string',
      position: 'integer',
      createdAt: 'datetime'
    });

    this.defaultOrderBy('position asc');

    this.hasMany('rankings');
    this.hasMany('comments', {constructorName: "CandidateComment"});
    this.belongsTo('election');
    this.belongsTo('creator', {constructorName: "User"});
    this.relatesToMany('commenters', function() {
      return this.comments().join(User).on(CandidateComment.creatorId.eq(User.id));
    });
  },

  afterInitialize: function() {
    this.rankingsByUsers = {};
  },

  afterRemoteDestroy: function() {
    this.rankings().each(function(ranking) {
      ranking.remotelyDestroyed();
    });
  },

  rankingByUser: function(user) {
    var relation = this.rankingsByUsers[user.id()];
    if (relation) return relation;
    return this.rankingsByUsers[user.id()] = this.rankings().where({userId: user.id()});
  },

  rankingByCurrentUser: function() {
    if (!Application.currentUser()) throw new Error("There is no current user");
    return this.rankingByUser(Application.currentUser());
  },

  belongsToCurrentUser: function() {
    return this.creator() === Application.currentUser();
  },

  editableByCurrentUser: function() {
    return Application.currentUser().admin() || this.belongsToCurrentUser() || this.organization().currentUserIsOwner();
  },

  organization: function() {
    return this.election().organization();
  },

  formattedCreatedAt: function() {
    return $.PHPDate("M j, Y @ g:ia", this.createdAt());
  },

  url: function() {
    return "/elections/" + this.electionId() + "/candidates/" + this.id();
  }
});
