_.constructor("Organization", Model.Record, {
  constructorProperties: {
    initialize: function() {
      this.columns({
        name: "string",
        description: "string",
        membersCanInvite: "boolean",
        electionCount: 'integer',
        memberCount: 'integer',
        useSsl: 'boolean',
        social: 'boolean',
        privacy: 'string',
        invitationCode: 'string'
      });

      this.hasMany("elections");
      this.relatesToMany("candidates", function() {
        return this.elections().joinThrough(Candidate);
      });
      this.relatesToMany("votes", function() {
        return this.elections().joinThrough(Vote);
      });

      this.hasMany("memberships", {orderBy: ["firstName asc", "emailAddress asc"]});
      this.relatesToMany("members", function() {
        return this.memberships().joinThrough(User);
      });
    },

    global: function() {
      return this.find({social: true});
    }
  },

  fetchMoreElections: function(fetchIfWeHaveLessThan) {
    if (this.fetchInProgressFuture) return this.fetchInProgressFuture;
    if (!this.numElectionsFetched) this.numElectionsFetched = 0;


    if (this.elections().size() >= (fetchIfWeHaveLessThan || this.electionCount())) {
      var future = new Monarch.Http.AjaxFuture();
      future.triggerSuccess();
      return future;
    }

    var offset, limit;
    // if we already fetched some, fetch 8 positions back to account for unseen swapping at the fringe
    if (this.numElectionsFetched > 0) {
      offset = this.numElectionsFetched - 8;
      limit = 24;
    } else {
      offset = 0;
      limit = 16;
    }

    var promise = $.ajax({
      url: "/elections",
      data: {
        organization_id: this.id(),
        offset: offset,
        limit: limit
      },
      dataType: 'records'
    });

    this.fetchInProgressFuture = promise;
    promise.success(function() {
      delete this.fetchInProgressFuture;
      this.numElectionsFetched += 16;
    }, this);

    return promise;
  },

  membershipForUser: function(user) {
    return this.memberships().find({userId: user.id()});
  },

  membershipForCurrentUser: function() {
    return this.membershipForUser(Application.currentUser());
  },

  currentUserIsMember: function() {
    return this.membershipForCurrentUser() != null;
  },

  currentUserIsOwner: function() {
    var currentUserMembership = this.memberships().find({userId: Application.currentUserId});
    if (!currentUserMembership) return false;
    return currentUserMembership.role() === "owner";
  },

  ensureCurrentUserCanParticipate: function() {
    var future = new Monarch.Http.AjaxFuture();
    if (!this.isPublic() && !this.currentUserIsMember()) {
      Application.layout.mustBeMemberMessage.show();
      future.triggerFailure();
    } else if (Application.currentUser().guest()) {
      Application.layout.signupPrompt.future = future;
      Application.layout.signupPrompt.showSignupForm();
      Application.layout.signupPrompt.show()
    } else {
      future.triggerSuccess();
    }
    return future;
  },

  currentUserCanEdit: function() {
    return Application.currentUser().admin() || this.currentUserIsOwner();
  },

  currentUserCanInvite: function() {
    return this.currentUserIsOwner() || (this.currentUserIsMember() && this.membersCanInvite());
  },

  isPublic: function() {
    return this.privacy() === "public";
  },

  hasNonAdminQuestions: function() {
    return !this.elections().where(Election.creatorId.neq(1)).empty();
  },

  invitationUrl: function() {
    return 'https://' + Application.HTTP_HOST + "/private/" + this.invitationCode();
  }
});
