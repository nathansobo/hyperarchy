//= require spec/spec_helper

describe("Routes", function() {
  var member, defaultGuest, defaultOrganization;
  beforeEach(function() {
    renderLayout();
    defaultOrganization = Organization.createFromRemote({id: 23});
    defaultGuest = User.createFromRemote({id: 1, defaultGuest: true, guest: true});
    member = defaultOrganization.makeMember({id: 2});
    spyOn(defaultGuest, 'defaultOrganization').andReturn(defaultOrganization);
    spyOn(member, 'defaultOrganization').andReturn(defaultOrganization);
    Application.currentUser(defaultGuest);
  });

  describe("/", function() {
    it("navigates to the current user's default organization page", function() {
      spyOn(_, 'defer').andCallFake(function(fn) {
        fn();
      });
      History.pushState(null, null, '/');
      
      expect(Path.routes.current).toBe(defaultOrganization.url());
      expect(_.defer).toHaveBeenCalled(); // firefox needs this
    });
  });

  describe("/organizations/:id", function() {
    describe("when the organization is present in the local repository", function() {
      it("shows only the organizationPage and assigns the id on it", function() {
        Organization.createFromRemote({id: 23});
        History.pushState(null, null, '/organizations/23');

        expect(Application.questionPage).toBeHidden();
        expect(Application.organizationPage).toBeVisible();
        expect(Application.organizationPage.params()).toEqual({organizationId: 23});
      });
    });
  });

  describe("/questions/:questionId", function() {
    it("shows only the questionsPage, assigns the id on it, and assigns the current user's rankings relation on ranked answers list", function() {
      Application.questionPage.show();
      History.pushState(null, null, '/questions/12');
      expect(Application.organizationPage).toBeHidden();
      expect(Application.questionPage).toBeVisible();

      expect(Application.questionPage.params()).toEqual({
        questionId: 12
      });
    });
  });

  describe("/questions/:questionId/votes/:voterId", function() {
    it("shows only the questionsPage, assigns the id on it, and assigns the specified user's rankings relation on the ranked answers list", function() {
      Application.questionPage.show();
      History.pushState(null, null, '/questions/12/votes/29');
      expect(Application.organizationPage).toBeHidden();
      expect(Application.questionPage).toBeVisible();
      expect(Application.questionPage.params()).toEqual({
        questionId: 12,
        voterId: 29
      });
    });
  });

  describe("/questions/:questionId/answers/new", function() {
    it("shows only the questionsPage assigns the question id, and shows the new answer form", function() {
      Application.questionPage.show();
      History.pushState(null, null, '/questions/12/answers/new');
      expect(Application.organizationPage).toBeHidden();
      expect(Application.questionPage).toBeVisible();
      expect(Application.questionPage.params()).toEqual({
        questionId: 12,
        answerId: 'new'
      });
    });
  });

  describe("/questions/:questionId/answers/:answerId", function() {
    it("shows only the questionsPage and assigns the id and selectedAnswerId on it", function() {
      Application.questionPage.show();
      History.pushState(null, null, '/questions/12/answers/33');
      expect(Application.organizationPage).toBeHidden();
      expect(Application.questionPage).toBeVisible();
      expect(Application.questionPage.params()).toEqual({
        questionId: 12,
        answerId: 33
      });
    });
  });

  describe("/organizations/:questionId/questions/new", function() {
    it("shows the questionsPage in new mode", function() {
      Application.organizationPage.show();
      History.pushState(null, null, '/organizations/1/questions/new');
      expect(Application.organizationPage).toBeHidden();
      expect(Application.questionPage).toBeVisible();
      expect(Application.questionPage.params()).toEqual({
        organizationId: 1,
        questionId: 'new'
      });
    });
  });

  describe("/account", function() {
    describe("if the current user is not a guest", function() {
      beforeEach(function() {
        Application.currentUser(member);
      });

      it("shows only the accountPage and assigns its user", function() {
        Application.organizationPage.show();
        History.pushState(null, null, '/account');
        expect(Application.organizationPage).toBeHidden();
        expect(Application.accountPage).toBeVisible();
        expect(Application.accountPage.params()).toEqual({userId: member.id()});
      });
    });

    describe("if the current user is a guest", function() {
      describe("if they log in / sign up at the prompt", function() {
        it("shows the account page and assigns its params", function() {
          Application.organizationPage.show();
          History.pushState(null, null, '/account');
          expect(Application.organizationPage).toBeVisible();

          expect(Application.loginForm).toBeVisible();
          Application.loginForm.emailAddress.val("dude@example.com");
          Application.loginForm.password.val("wicked");
          Application.loginForm.form.submit();
          expect($.ajax).toHaveBeenCalled();
          simulateAjaxSuccess({ current_user_id: member.id() });

          expect(Application.organizationPage).toBeHidden();
          expect(Application.accountPage).toBeVisible();
          expect(Application.accountPage.params()).toEqual({userId: member.id()});
        });
      });

      describe("if they cancel at the prompt", function() {
        it("navigates them to their default organization", function() {
          Application.organizationPage.show();
          History.pushState(null, null, '/account');
          expect(Application.organizationPage).toBeVisible();

          expect(Application.loginForm).toBeVisible();
          spyOn(Application, 'showPage');
          Application.loginForm.close();

          expect(Path.routes.current).toBe(defaultGuest.defaultOrganization().url());
        });
      });
    });
  });
});
