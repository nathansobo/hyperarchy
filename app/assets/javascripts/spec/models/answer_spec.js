//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

describe("Answer", function() {
  describe("#editableByCurrentUser()", function() {
    var organization, answer, admin, owner, creator, otherUser, organization;
    beforeEach(function() {
      organization = Organization.createFromRemote({id: 1});
      var question = organization.questions().createFromRemote({id: 1});
      owner = User.createFromRemote({id: 1});
      organization.memberships().createFromRemote({userId: owner.id(), role: 'owner'});
      admin = User.createFromRemote({id: 2, admin: true});
      otherUser = User.createFromRemote({id: 3});
      creator = User.createFromRemote({id: 4});
      answer = question.answers().createFromRemote({id: 1, creatorId: creator.id()});

      attachLayout();
    });

    it("returns true only if the current user is an admin, an owner of the answer's organization, or the creator of the answer", function() {
      Application.currentUser(admin);
      expect(answer.editableByCurrentUser()).toBeTruthy();

      Application.currentUser(owner);
      expect(answer.editableByCurrentUser()).toBeTruthy();

      Application.currentUser(creator);
      expect(answer.editableByCurrentUser()).toBeTruthy();

      Application.currentUser(otherUser);
      expect(answer.editableByCurrentUser()).toBeFalsy();
    });
  });

  describe("#afterRemoteDestroy", function() {
    it("destroys any associated rankings locally, because that would have happened on the server but we may not have heard about it yet", function() {
      var answer = Answer.createFromRemote({id: 1});
      answer.rankings().createFromRemote({id: 1});
      answer.rankings().createFromRemote({id: 2});
      var ranking3 = Ranking.createFromRemote({id: 3, answerId: 99});

      answer.remotelyDestroyed();

      expect(Ranking.find(1)).toBeUndefined();
      expect(Ranking.find(2)).toBeUndefined();
      expect(Ranking.find(3)).toBe(ranking3);
    });
  });

  describe("#url", function() {
    it("returns the correct url", function() {
      expect(Answer.createFromRemote({id: 11, questionId: 22, body: "Fruitloops"}).url()).toEqual('/questions/22/answers/11');
    });
  });
});
