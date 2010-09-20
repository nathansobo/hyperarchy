_.constructor("User", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      firstName: 'string',
      lastName: 'string',
      emailAddress: 'string',
      dismissedWelcomeBlurb: 'boolean'
    });

    this.hasMany('rankings');
    this.hasMany('memberships');

    this.relatesToMany('confirmedMemberships', function() {
      return this.memberships().where({pending: false});
    });
    this.relatesToMany('organizations', function() {
      return this.confirmedMemberships().joinThrough(Organization);
    });
  },

  fullName: function() {
    return this.firstName() + " " + this.lastName();
  }
});
