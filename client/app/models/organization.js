_.constructor("Organization", Model.Record, {
  constructorProperties: {
    initialize: function() {
      this.columns({
        name: "string",
        description: "string",
        membersCanInvite: "boolean",
        dismissedWelcomeGuide: 'boolean',
        electionCount: 'integer',
        useSsl: 'boolean'
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
      return this.find({name: "Alpha Testers"});
    }
  },

  fetchMoreElections: function() {
    if (this.fetchInProgressFuture) return this.fetchInProgressFuture;
    if (!this.numElectionsFetched) this.numElectionsFetched = 0;
    if (this.elections().size() === this.electionCount()) {
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

    var future = Server.get("/fetch_election_data", {
      organization_id: this.id(),
      offset: offset,
      limit: limit
    });

    this.fetchInProgressFuture = future;
    future.onSuccess(function() {
      delete this.fetchInProgressFuture;
      this.numElectionsFetched += 16;
    }, this);

    return future;
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
    return currentUserMembership.role() === "owner";
  },

  currentUserCanEdit: function() {
    return Application.currentUser().admin() || this.currentUserIsOwner();
  }
});
