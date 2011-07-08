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
    it("fetches the and renders the organization's questions, and fetches more when the view scrolls", function() {
      var user, organization1, question1, question2, remainingScrollHeight;

      $('#jasmine_content').html(Application);
      Application.organizationPage.show();

      enableAjax();
      user = login();
      usingBackdoor(function() {
        organization1 = Organization.create();
        organization2 = Organization.create();
        user.memberships().create({organizationId: organization1.id()});
        user.memberships().create({organizationId: organization2.id()});
        createMultiple({
          count: 33,
          tableName: 'questions',
          fieldValues: { organizationId: organization1.id() }
        });
        organization2.questions().create();
        Organization.fetch(); // fetch counts
        Question.clear();
      });

      waitsFor("questions to be fetched", function(complete) {
        organizationPage.organization(organization1).success(complete);
        expect(organization1.questions().size()).toBe(0);
      });

      runs(function() {
        expect(organization1.questions().size()).toBe(16);
        var questionsList = organizationPage.questionsList;
        organization1.questions().each(function(question) {
          expect(questionsList).toContain("li:contains('" + question.body() + "')");
        });

        var question = organization1.questions().first();

        spyOn(Application, 'showPage');

        questionsList.find("li:contains('" + question.body() + "') > div").click();
        expect(Path.routes.current).toBe("/questions/" + question.id());

        spyOn(organizationPage, 'remainingScrollHeight').andReturn(100);
        $(window).scroll();
      });

      waitsFor("more questions to be fetched after scrolling", function() {
        return organization1.questions().size() === 32;
      });

      runs(function() {
        $(window).scroll();
      });

      waitsFor("more questions to be fetched after scrolling again", function() {
        return organization1.questions().size() === 33;
      });

      runs(function() {
        expect(organizationPage.listBottom).toBeHidden();
      });

      // switch to org 2

      waitsFor("organization 2 questions to be fetched", function(complete) {
        organizationPage.organization(organization2).success(complete);
        expect(organizationPage.questionsList.find('li')).not.toExist();
        expect(organizationPage.loading()).toBeTruthy();
      })

      runs(function() {
        expect(organizationPage.questionsList.find('li').length).toBe(1);
        expect(organizationPage.loading()).toBeFalsy();
      });
    });
  });

  describe("when the new question button is clicked", function() {
    it("navigates to the new question form for the current organization", function() {
      $("#jasmine_content").html(Application);
      var organization = Organization.createFromRemote({id: 34});
      organizationPage.organization(organization);
      organizationPage.newQuestionButton.click();
      expect(Application.newQuestion).toBeVisible();
    });
  });
});
