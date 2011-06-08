//= require spec/spec_helper

describe("Organization", function() {
  describe("#url", function() {
    it("returns the correct url", function() {
      expect(Organization.createFromRemote({id: 22}).url()).toEqual('/organizations/22');
    });
  });
});