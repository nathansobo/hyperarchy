_.constructor("QuestionComment", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      questionId: 'key',
      creatorId: 'key',
      body: 'string',
      updatedAt: 'datetime',
      createdAt: 'datetime'
    });

    this.belongsTo('question');
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

  formattedCreatedAt: function() {
    return $.PHPDate("n/j/y g:ia", this.createdAt());
  },

  trackCreate: function() {
    mpq.push(['track', "Create QuestionComment", {
      mp_note: this.body(),
      body: this.body(),
      id: this.id(),
      question: this.question().body(),
      questionId: this.questionId(),
      creator: this.creator().fullName(),
      creatorId: this.creatorId()
    }]);
  }
});
