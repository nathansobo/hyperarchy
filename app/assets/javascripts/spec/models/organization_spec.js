//= require spec/spec_helper

describe("Organization", function() {
  var organization;

  beforeEach(function() {
    organization = Organization.createFromRemote({id: 22, electionCount: 32});
  });

  describe(".findSocial", function() {
    it("returns the social organization", function() {
      var nonSocial = Organization.createFromRemote({id: 1, social: false});
      var social = Organization.createFromRemote({id: 2, social: true});
      expect(Organization.findSocial()).toBe(social);
    });
  });

  describe("#fetchMoreElections", function() {
    it("fetches elections in blocks, first of 16, then of 24 with 8 elections of overlap with the previously fetched block", function() {
      expect(organization.numElectionsFetched).toBe(0);

      organization.fetchMoreElections();
      expect($.ajax).toHaveBeenCalledWith({
        url: "/elections",
        data: {
          organization_id: organization.id(),
          offset: 0,
          limit: 16
        },
        dataType: 'records'
      });

      $.ajax.reset();
      organization.fetchMoreElections();
      expect($.ajax).not.toHaveBeenCalled();

      simulateAjaxSuccess();
      expect(organization.numElectionsFetched).toBe(16);

      organization.fetchMoreElections();

      expect($.ajax).toHaveBeenCalledWith({
        url: "/elections",
        data: {
          organization_id: organization.id(),
          offset: 8,
          limit: 24
        },
        dataType: 'records'
      });

      simulateAjaxSuccess();

      expect(organization.numElectionsFetched).toBe(32);

      $.ajax.reset();

      organization.fetchMoreElections(); // num fetched == election count
      expect($.ajax).not.toHaveBeenCalled();
    });
  });


  describe("#url", function() {
    it("returns the correct url", function() {
      expect(organization.url()).toEqual('/organizations/22');
    });
  });
});