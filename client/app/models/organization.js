_.constructor("Organization", Model.Record, {
  constructorProperties: {
    initialize: function() {
      this.columns({
        name: "string",
        description: "string"
      });

      this.hasMany("elections");
      this.hasMany("memberships");
      this.relatesToMany("members", function() {
        return this.memberships().joinThrough(User);
      });
    },

    global: function() {
      return this.find({name: "Global"});
    }
  }

});
