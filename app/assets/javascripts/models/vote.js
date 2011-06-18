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
    var url = "/elections/" + this.electionId();
    if (this.userId() !== Application.currentUserId()) url += '/votes/' + this.userId();
    return url;
  }
});
