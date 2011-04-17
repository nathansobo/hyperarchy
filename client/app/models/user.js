_.constructor("User", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      firstName: 'string',
      lastName: 'string',
      emailAddress: 'string',
      emailHash: 'string',
      admin: 'boolean',
      dismissedWelcomeBlurb: 'boolean',
      dismissedWelcomeGuide: 'boolean',
      guest: 'boolean'
    });

    this.hasMany('rankings');
    this.hasMany('memberships');
    this.hasMany('electionVisits');

    this.relatesToMany('confirmedMemberships', function() {
      return this.memberships().where({pending: false});
    });
    this.relatesToMany('organizations', function() {
      return this.confirmedMemberships().joinThrough(Organization);
    });

    this.relatesToMany('organizationsPermittedToInvite', function() {
      return this.memberships().where({role: "owner"}).joinThrough(Organization)
        .union(this.organizations().where({membersCanInvite: true}));
    });
  },

  isCurrent: function() {
    return Application.currentUserId == this.id();
  },

  fullName: function() {
    return this.firstName() + " " + this.lastName();
  },

  gravatarUrl: function(size) {
    if (!size) size = 40;
    var baseUrl = Application.sslEnabled() ? "https://secure.gravatar.com" : "http://www.gravatar.com";
    return baseUrl + "/avatar/" + this.emailHash() + "?s=" + size.toString() + "&d=404"
  },

  defaultOrganization: function() {
    return this.memberships().orderBy(Membership.lastVisited.desc()).first().organization();
  }
});
