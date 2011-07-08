//= require spec/spec_helper

describe("Views.Lightboxes.NewQuestion", function() {
  var newQuestionForm, organization, member, guest;
  beforeEach(function() {
    renderLayout();
    newQuestionForm = Application.newQuestion.show();
    organization = Organization.createFromRemote({id: 1});
    member = organization.makeMember({id: 1});
    guest =  organization.makeMember({id: 2, guest: true});
    Application.currentUser(member);
    Application.currentOrganization(organization);
    useFakeServer();
  });

  describe("when the form is submitted", function() {
    describe("when the current user is a member", function() {
      describe("when the body field is not blank", function() {
        it("creates an question, hides the form, and navigates to its url", function() {
          spyOn(Application, 'showPage');

          newQuestionForm.body.val("What are you doing saturday night?");
          newQuestionForm.details.val("I am very lonely.");
          newQuestionForm.form.submit();

          expect(Server.creates.length).toBe(1);

          var createdQuestion = Server.lastCreate.record;
          expect(createdQuestion.organization()).toBe(organization);
          expect(createdQuestion.body()).toBe("What are you doing saturday night?");
          expect(createdQuestion.details()).toBe("I am very lonely.");

          Server.lastCreate.simulateSuccess();

          expect(newQuestionForm).toBeHidden();
          expect(Path.routes.current).toBe(createdQuestion.url());
        });
      });

      describe("when the body field is blank", function() {
        it("does not create an question or hide the form", function() {
          newQuestionForm.body.val("    ");
          newQuestionForm.form.submit();
          expect(Server.creates.length).toBe(0);
          expect(newQuestionForm).toBeVisible();
        });
      });

      describe("when the body field exceeds 140 characters", function() {

        it("does not create the question or hide the form", function() {
          var longBody = ""
          _.times(141, function() {
            longBody += "X"
          });
          newQuestionForm.body.val(longBody);
          newQuestionForm.form.submit();
          expect(Server.creates.length).toBe(0);
          expect(newQuestionForm).toBeVisible();
        });
      });

    });
    
    describe("when the current user is a guest", function() {
      beforeEach(function() {
        Application.currentUser(guest);
      });
      
      describe("when the user logs in / signs up at the prompt", function() {
        it("creates the question and navigates to it", function() {
          newQuestionForm.body.val("What is your favorite vegatable?");
          newQuestionForm.form.submit();
          expect(Server.creates.length).toBe(0);
          expect(Application.signupForm).toBeVisible();
          Application.signupForm.firstName.val("Dude");
          Application.signupForm.lastName.val("Richardson");
          Application.signupForm.emailAddress.val("dude@example.com");
          Application.signupForm.password.val("wicked");
          Application.signupForm.form.submit();
          expect($.ajax).toHaveBeenCalled();

          $.ajax.mostRecentCall.args[0].success({ current_user_id: member.id() });

          expect(Server.creates.length).toBe(1);
          var createdRecord = Server.lastCreate.record
          expect(createdRecord.body()).toBe("What is your favorite vegatable?");

          spyOn(Application, 'showPage');
          Server.lastCreate.simulateSuccess();
          expect(Path.routes.current).toBe(createdRecord.url());
        });
      });
      
      describe("when the user dismisses the prompt", function() {
        it("does not create a question but leaves the lightbox visible", function() {
          newQuestionForm.body.val("What is your favorite vegatable?");
          newQuestionForm.details.val("mine's chard.");
          newQuestionForm.form.submit();
          expect(Server.creates.length).toBe(0);
          expect(Application.signupForm).toBeVisible();
          Application.signupForm.close();
          expect(Server.creates.length).toBe(0);
          expect(newQuestionForm).toBeVisible();
          expect(Application.darkenedBackground).toBeVisible();
          expect(newQuestionForm.body.val()).toBe("What is your favorite vegatable?");
          expect(newQuestionForm.details.val()).toBe("mine's chard.");
        });
      });
    });
  });

  describe("when the form is shown", function() {
    it("focuses the textarea", function() {
      expect(newQuestionForm.body).toHaveFocus();
    });

    it("clears out the old text from previous showings", function() {
      newQuestionForm.body.val("Junk");
      newQuestionForm.details.val("Garbage");
      newQuestionForm.close();
      newQuestionForm.show();
      expect(newQuestionForm.body.val()).toBe("");
      expect(newQuestionForm.details.val()).toBe("");
    });
  });

  describe("when typing in the body", function() {
    it("adjusts the chars remaining", function() {
      newQuestionForm.body.val("123")
      newQuestionForm.body.keyup();
      expect(newQuestionForm.charsRemaining.text()).toBe('137');
    });
  });

  describe("when enter is pressed in the body textarea", function() {
    it("submits the form", function() {
      newQuestionForm.body.val("What's your favorite kinda cheese?");
      newQuestionForm.body.trigger({ type : 'keydown', which : 13 });

      expect(Server.creates.length).toBe(1);

    });
  });
});

