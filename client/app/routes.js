module("Routes", {
  electionPath: function(election) {
    return "organizations/" + election.organizationId() + "/elections/" + election.id();
  }
});