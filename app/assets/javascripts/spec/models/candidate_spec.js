//= require spec/spec_helper

describe("Candidate", function() {
  describe("#editableByCurrentUser()", function() {
    var organization, candidate, admin, owner, creator, otherUser, organization;
    beforeEach(function() {
      organization = Organization.createFromRemote({id: 1});
      var election = organization.elections().createFromRemote({id: 1});
      owner = User.createFromRemote({id: 1});
      organization.memberships().createFromRemote({userId: owner.id(), role: 'owner'});
      admin = User.createFromRemote({id: 2, admin: true});
      otherUser = User.createFromRemote({id: 3});
      creator = User.createFromRemote({id: 4});
      candidate = election.candidates().createFromRemote({id: 1, creatorId: creator.id()});

      attachLayout();
    });

    it("returns true only if the current user is an admin, an owner of the candidate's organization, or the creator of the candidate", function() {
      Application.currentUser(admin);
      expect(candidate.editableByCurrentUser()).toBeTruthy();

      Application.currentUser(owner);
      expect(candidate.editableByCurrentUser()).toBeTruthy();

      Application.currentUser(creator);
      expect(candidate.editableByCurrentUser()).toBeTruthy();

      Application.currentUser(otherUser);
      expect(candidate.editableByCurrentUser()).toBeFalsy();
    });
  });

  describe("#afterRemoteDestroy", function() {
    it("destroys any associated rankings locally, because that would have happened on the server but we may not have heard about it yet", function() {
      var candidate = Candidate.createFromRemote({id: 1});
      candidate.rankings().createFromRemote({id: 1});
      candidate.rankings().createFromRemote({id: 2});
      var ranking3 = Ranking.createFromRemote({id: 3, candidateId: 99});

      candidate.remotelyDestroyed();

      expect(Ranking.find(1)).toBeUndefined();
      expect(Ranking.find(2)).toBeUndefined();
      expect(Ranking.find(3)).toBe(ranking3);
    });
  });

  describe("#url", function() {
    it("returns the correct url", function() {
      expect(Candidate.createFromRemote({id: 11, electionId: 22, body: "Fruitloops"}).url()).toEqual('/elections/22/candidates/11');
    });
  });
});
