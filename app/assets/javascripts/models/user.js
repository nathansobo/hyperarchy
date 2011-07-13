_.constructor("User", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      firstName: 'string',
      lastName: 'string',
      emailAddress: 'string',
      emailHash: 'string',
      admin: 'boolean',
      guest: 'boolean',
      defaultGuest: 'boolean',
      emailEnabled: 'boolean',
      facebookUid: 'string'
    });

    this.syntheticColumn('fullName', function() {
      return this.signal('firstName').combine(this.signal('lastName'), function(firstName, lastName) {
        return firstName + " " + lastName;
      });
    });

    this.hasMany('votes');
    this.hasMany('rankings');
    this.hasMany('answers', {key: 'creatorId'});
    this.hasMany('questions', {key: 'creatorId'});
    this.hasMany('memberships');
    this.hasMany('questionVisits');

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

  avatarUrl: function(size) {
    if (this.facebookUid()) {
      return this.facebookPhotoUrl();
    } else {
      return this.gravatarUrl(size);
    }
  },

  facebookPhotoUrl: function() {
    return "https://graph.facebook.com/" + this.facebookUid() + "/picture?type=square";
  },

  gravatarUrl: function(size) {
    if (!size) size = 40;
    var baseUrl = "https://secure.gravatar.com";
    return baseUrl + "/avatar/" + this.emailHash() + "?s=" + size.toString() + "&d=404"
  },

  defaultOrganization: function() {
    return this.memberships().orderBy(Membership.lastVisited.desc()).first().organization();
  },

  rankingsForQuestion: function(question) {
    return this.rankings().where({questionId: question.id()});
  },
});
