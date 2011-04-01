_.constructor("Vote", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      userId: 'key',
      electionId: 'key',
      updatedAt: 'datetime'
    });

    this.belongsTo('election');
    this.belongsTo('user');
    this.hasMany('rankings');
  },

  formattedUpdatedAt: function() {
    return $.PHPDate("M j, Y @ g:ia", this.updatedAt());
  }
});
