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

  describe("#url", function() {
    it("returns the correct url", function() {
      expect(Candidate.createFromRemote({id: 11, electionId: 22, body: "Fruitloops"}).url()).toEqual('/elections/22/candidates/11');
    });
  });
});
