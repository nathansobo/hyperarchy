_.constructor("Vote", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      userId: 'key',
      electionId: 'key',
      updatedAt: 'datetime'
    });

    this.syntheticColumn('formattedUpdatedAt', function() {
      return this.signal('updatedAt', function(updatedAt) {
        return $.PHPDate("M j, Y @ g:ia", updatedAt);
      });
    });

    this.belongsTo('election');
    this.belongsTo('user');
    this.hasMany('rankings');
  },

  url: function() {
    return "/elections/" + this.electionId() + "/votes/" + this.userId();
  }
});
