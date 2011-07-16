_.constructor("AnswerComment", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      answerId: 'key',
      creatorId: 'key',
      body: 'string',
      updatedAt: 'datetime',
      createdAt: 'datetime'
    });

    this.belongsTo('answer');
    this.belongsTo('creator', {constructorName: "User"});
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

  question: function() {
    return this.answer().question();
  },

  formattedCreatedAt: function() {
    return $.PHPDate("n/j/y g:ia", this.createdAt());
  },

  trackCreate: function() {
    mpq.push(['track', "Create AnswerComment", {
      mp_note: this.body(),
      body: this.body(),
      creatorId: this.creatorId(),
      answerId: this.answerId()
    }]);
  }
});
