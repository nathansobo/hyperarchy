_.constructor("User", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      firstName: 'string',
      lastName: 'string',
      emailAddress: 'string',
      admin: 'boolean',
      dismissedWelcomeBlurb: 'boolean',
      dismissedWelcomeGuide: 'boolean'
    });

    this.hasMany('rankings');
    this.hasMany('memberships');

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
    var baseUrl = window.location.protocol === "https:" ? "https://secure.gravatar.com" : "http://www.gravatar.com";
    return baseUrl + "/avatar/" + this.emailHash() + "?s=" + size.toString() + "&d=404"
  },

  emailHash: function() {
    return hex_md5(this.emailAddress().toLowerCase());
  },

  lastVisitedOrganization: function() {
    return this.memberships().orderBy(Membership.lastVisited.desc()).first().organization();
  }
});
