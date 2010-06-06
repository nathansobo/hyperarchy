_.constructor("Membership", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      organizationId: "key",
      userId: "key",
      role: "string",
      pending: "boolean"
    });

    this.belongsTo("organization");
    this.belongsTo("user");
  }
});
