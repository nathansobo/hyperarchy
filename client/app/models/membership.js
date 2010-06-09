_.constructor("Membership", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      organizationId: "key",
      userId: "key",
      role: "string",
      pending: "boolean",
      firstName: "string",
      lastName: "string",
      emailAddress: "string"
    });

    this.belongsTo("organiza  tion");
    this.belongsTo("user");
  }
});
