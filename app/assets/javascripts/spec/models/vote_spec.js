//= require spec/spec_helper

describe("Vote", function() {
  var vote;
  beforeEach(function() {
    vote = Vote.createFromRemote({id: 1, updatedAt: 1308353647242});
  });

  describe("#formattedUpdatedAt", function() {
    it("returns a formatted date and time", function() {
      expect(vote.formattedUpdatedAt()).toEqual("Jun 17, 2011 @ 4:34pm");
    });
  });
});