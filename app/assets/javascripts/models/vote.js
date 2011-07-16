_.constructor("Vote", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      userId: 'key',
      questionId: 'key',
      updatedAt: 'datetime'
    });

    this.syntheticColumn('formattedUpdatedAt', function() {
      return this.signal('updatedAt', function(updatedAt) {
        return $.PHPDate("M j, Y @ g:ia", updatedAt);
      });
    });

    this.belongsTo('question');
    this.belongsTo('user');
    this.hasMany('rankings');
  },

  url: function() {
    var url = "/questions/" + this.questionId();
    if (this.userId() !== Application.currentUserId()) url += '/votes/' + this.userId();
    return url;
  },

  trackView: function() {
    mpq.push(['track', "View Ranking", {
      mp_note: this.user().fullName(),
      question: this.question().body(),
      questionId: this.questionId(),
      user: this.user().fullName(),
      userId: this.userId()
    }]);
  }
});
