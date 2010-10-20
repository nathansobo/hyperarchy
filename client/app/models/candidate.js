_.constructor("Candidate", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      electionId: 'key',
      creatorId: 'key',
      body: 'string',
      details: 'string',
      position: 'integer'
    });

    this.hasMany('rankings');
    this.belongsTo('election');
    this.belongsTo('creator', {constructorName: "User"});
  },

  afterInitialize: function() {
    this.rankingsByUsers = {};
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

  organization: function() {
    return this.election().organization();
  }
});
