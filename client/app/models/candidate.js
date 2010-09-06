_.constructor("Candidate", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      electionId: 'key',
      creatorId: 'key',
      body: 'string',
      position: 'integer'
    });

    this.hasMany('rankings');
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
    return this.rankingByUser(Application.currentUser());
  },

  belongsToCurrentUser: function() {
    return this.creator() === Application.currentUser();
  }
});
