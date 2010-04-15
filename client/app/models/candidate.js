_.constructor("Candidate", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      electionId: 'key',
      body: 'string'
    });


    this.hasMany('rankings');
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
  }
});
