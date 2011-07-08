_.constructor("Membership", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      organizationId: "key",
      userId: "key",
      role: "string",
      firstName: "string",
      lastName: "string",
      emailAddress: "string",
      lastVisited: "datetime",
      notifyOfNewQuestions: "string",
      notifyOfNewAnswers: "string",
      notifyOfNewCommentsOnOwnAnswers: "string",
      notifyOfNewCommentsOnRankedAnswers: "string"
    });

    this.belongsTo("organization");
    this.belongsTo("user");
  },

  fullName: function() {
    if (this.firstName() && this.lastName()) {
      return this.firstName() + " " + this.lastName();
    } else {
      return null;
    }
  }
});
