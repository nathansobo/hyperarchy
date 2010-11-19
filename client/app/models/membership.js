_.constructor("Membership", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      organizationId: "key",
      userId: "key",
      role: "string",
      pending: "boolean",
      firstName: "string",
      lastName: "string",
      emailAddress: "string",
      lastVisited: "datetime"
    });

    this.belongsTo("organization");
    this.belongsTo("user");
  },

  fullName: function() {
    return this.firstName() + " " + this.lastName();
  }
});
