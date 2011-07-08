_.constructor("QuestionVisit", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      userId: 'key',
      questionId: 'key',
      updatedAt: 'datetime'
    });

    this.belongsTo('question');
    this.belongsTo('user');
  }
});
