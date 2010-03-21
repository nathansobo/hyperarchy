_.constructor("Organization", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      name: "string"
    });

    this.hasMany("elections");
  }
});
