_.constructor("User", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      firstName: 'string',
      lastName: 'string',
      emailAddress: 'string'
    });

    this.hasMany('rankings');
    this.hasMany('memberships');
    this.relatesToMany('organizations', function() {
      return this.memberships().joinThrough(Organization);
    });
  },

  fullName: function() {
    return this.firstName() + " " + this.lastName();
  }
});
