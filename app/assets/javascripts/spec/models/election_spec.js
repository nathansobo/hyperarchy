//= require spec/spec_helper

describe("Election", function() {
  describe("#url", function() {
    it("returns the correct url", function() {
      expect(Election.createFromRemote({id: 22}).url()).toEqual('/elections/22');
    });
  });
});
