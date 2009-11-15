constructor("Organization", Model.Record, {
  constructor_initialize: function() {
    this.columns({
      name: "string"
    });

    this.has_many("elections");
  }
});
