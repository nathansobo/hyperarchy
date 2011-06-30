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
    it("fetches the organization's elections, then renders them and attaches click handlers", function() {
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
        organization.fetch();
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

        spyOn(Application, 'showPage');

        electionsList.find("li:contains('" + election.body() + "') > div").click();
        expect(Path.routes.current).toBe("/elections/" + election.id());
      });
    });
  });

  describe("when the new question button is clicked", function() {
    it("navigates to the new question form for the current organization", function() {
      $("#jasmine_content").html(Application);
      var organization = Organization.createFromRemote({id: 34});
      organizationPage.organization(organization);
      organizationPage.newElectionButton.click();
      expect(Application.newElection).toBeVisible();
    });
  });

  describe("when the organization page is shown and hidden", function() {
    it("applies and removes the normal-height class to/from the layout", function() {
      organizationPage.show();
      expect(Application).toHaveClass('normal-height');
      organizationPage.hide();
      expect(Application).not.toHaveClass('normal-height');
    });
  });
});
