_.constructor("User", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      full_name: 'string'
    });

    this.hasMany('rankings');
    this.hasMany('memberships');
    this.relatesToMany('organizations', function() {
      return this.memberships().joinThrough(Organization);
    });
  }
});
