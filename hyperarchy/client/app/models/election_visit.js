_.constructor("ElectionVisit", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      userId: 'key',
      electionId: 'key',
      updatedAt: 'datetime'
    });

    this.belongsTo('election');
    this.belongsTo('user');
  }
});
