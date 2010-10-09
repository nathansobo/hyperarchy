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
  },

  gravatarUrl: function(size) {
    if (!size) size = 40;
    return "http://www.gravatar.com/avatar/" + this.emailHash() + "?s=40&d=mm"
  },

  emailHash: function() {
    return hex_md5(this.emailAddress().toLowerCase());
  }
});
