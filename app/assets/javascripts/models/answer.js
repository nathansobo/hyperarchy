//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

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

  fullScreenUrl: function() {
    return this.url() + "/full_screen";
  },

  mixpanelNote: function() {
    return this.body();
  },

  previous: function() {
    return this.question().answers().where(Answer.position.lt(this.position())).last();
  },

  next: function() {
    return this.question().answers().where(Answer.position.gt(this.position())).first();
  }
});
