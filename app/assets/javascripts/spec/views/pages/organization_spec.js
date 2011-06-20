//= require spec/spec_helper

describe("Views.Pages.Organization", function() {

  var organizationPage;
  beforeEach(function() {
    attachLayout();
    organizationPage = Application.organizationPage;
  });

  describe("when the params are assigned", function() {
    var organization;
    beforeEach(function() {
      Organization.createFromRemote({id: 1, social: true, name: "Hyperarchy Social"});
      organization = Organization.createFromRemote({id: 100, name: "Watergate"});
    });

    describe("when the organization exists in the local repository", function() {
      it("assigns the organization", function() {
        organizationPage.params({organizationId: organization.id()});
        expect(organizationPage.organization()).toBe(organization);
      });
    });

    describe("when the organization does not exist in the local repository", function() {
      it("navigates to the organization page for Hyperarchy Social", function() {
        organizationPage.params({organizationId: -1});
        expect(organizationPage.organization()).toBe(Organization.findSocial());
      });
    });

    it("assigns the currentOrganizationId on the layout", function() {
      organizationPage.params({organizationId: organization.id()});
      expect(Application.currentOrganizationId()).toBe(organization.id());
    });
  });

  describe("when the organization is assigned", function() {
    it("fetches the organization's elections", function() {
      var user, organization, election1, election2;

      enableAjax();
      user = login();
      usingBackdoor(function() {
        organization = Organization.create();
        user.memberships().create({organizationId: organization.id()});
        createMultiple({
          count: 17,
          tableName: 'elections',
          fieldValues: { organizationId: organization.id() }
        });
        Election.clear();
      });

      waitsFor("elections to be fetched", function(complete) {
        organizationPage.organization(organization).success(complete);
        expect(organization.elections().size()).toBe(0);
      });

      runs(function() {
        expect(organization.elections().size()).toBe(16);
        var electionsList = organizationPage.electionsList;
        organization.elections().each(function(election) {
          expect(electionsList).toContain("li:contains('" + election.body() + "')");
        });

        var election = organization.elections().first();
        electionsList.find("li:contains('" + election.body() + "')").click();
        expect(Path.routes.current).toBe("/elections/" + election.id());
      });
    });
  });
});