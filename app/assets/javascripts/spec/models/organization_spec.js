//= require spec/spec_helper

describe("Organization", function() {

  describe(".findSocial", function() {
    it("returns the social organization", function() {
      var nonSocial = Organization.createFromRemote({id: 1, social: false});
      var social = Organization.createFromRemote({id: 2, social: true});
      expect(Organization.findSocial()).toBe(social);
    });
  });

  describe("#url", function() {
    it("returns the correct url", function() {
      expect(Organization.createFromRemote({id: 22}).url()).toEqual('/organizations/22');
    });
  });
});