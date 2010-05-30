_.constructor("Membership", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      organizationId: "key",
      userId: "key"
    });

    this.belongsTo("organization");
    this.belongsTo("user");
  }
});
