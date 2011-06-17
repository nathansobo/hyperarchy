_.constructor("User", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      firstName: 'string',
      lastName: 'string',
      emailAddress: 'string',
      emailHash: 'string',
      admin: 'boolean',
      guest: 'boolean'
    });

    this.hasMany('votes');
    this.hasMany('rankings');
    this.hasMany('memberships');
    this.hasMany('electionVisits');

    this.relatesToMany('organizations', function() {
      return this.memberships().joinThrough(Organization);
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
    var baseUrl = "https://secure.gravatar.com";
    return baseUrl + "/avatar/" + this.emailHash() + "?s=" + size.toString() + "&d=404"
  },

  defaultOrganization: function() {
    return this.memberships().orderBy(Membership.lastVisited.desc()).first().organization();
  },

  rankingsForElection: function(election) {
    return this.rankings().where({electionId: election.id()});
  },
});
