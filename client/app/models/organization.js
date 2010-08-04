_.constructor("Organization", Model.Record, {
  constructorProperties: {
    initialize: function() {
      this.columns({
        name: "string",
        description: "string"
      });

      this.hasMany("elections", {orderBy: "updatedAt desc"});
      this.hasMany("memberships");
      this.relatesToMany("members", function() {
        return this.memberships().joinThrough(User);
      });
    },

    global: function() {
      return this.find({name: "Alpha Testers"});
    }
  }

});
