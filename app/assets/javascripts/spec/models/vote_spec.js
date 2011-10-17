//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

describe("Vote", function() {
  var vote, user;
  beforeEach(function() {
    user = User.createFromRemote({id: 1});
    vote = user.votes().createFromRemote({id: 1, questionId: 33, updatedAt: 1308353647242});
  });

  describe("#formattedUpdatedAt", function() {
    it("returns a formatted date and time", function() {
      expect(vote.formattedUpdatedAt()).toEqual("Jun 17, 2011 @ 4:34pm");
    });
  });

  describe("#url", function() {
    it("returns the correct url", function() {
      attachLayout();
      expect(vote.url()).toEqual('/questions/33/votes/1');

      Application.currentUser(user);

      expect(vote.url()).toEqual('/questions/33');
    });
  });
});
