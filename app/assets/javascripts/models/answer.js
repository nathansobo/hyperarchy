_.constructor("Answer", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      questionId: 'key',
      creatorId: 'key',
      body: 'string',
      details: 'string',
      position: 'integer',
      createdAt: 'datetime',
      commentCount: 'integer'
    });

    this.defaultOrderBy('position asc');

    this.hasMany('rankings');
    this.hasMany('comments', {constructorName: "AnswerComment"});
    this.belongsTo('question');
    this.belongsTo('creator', {constructorName: "User"});
    this.relatesToMany('commenters', function() {
      return this.comments().join(User).on(AnswerComment.creatorId.eq(User.id));
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
    return this.question().organization();
  },

  formattedCreatedAt: function() {
    return $.PHPDate("M j, Y @ g:ia", this.createdAt());
  },

  url: function() {
    return "/questions/" + this.questionId() + "/answers/" + this.id();
  },

  mixpanelNote: function() {
    return this.body();
  }
});
