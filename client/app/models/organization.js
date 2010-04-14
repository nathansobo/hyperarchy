_.constructor("Organization", Model.Record, {
  constructorProperties: {
    initialize: function() {
      this.columns({
        name: "string"
      });

      this.hasMany("elections");
    },

    global: function() {
      return this.find({name: "Global"});
    }
  }

});
