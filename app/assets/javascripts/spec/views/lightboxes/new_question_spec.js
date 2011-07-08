//= require spec/spec_helper

describe("Views.Lightboxes.NewElection", function() {
  var newElectionForm, organization, member, guest;
  beforeEach(function() {
    renderLayout();
    newElectionForm = Application.newElection.show();
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
        it("creates an election, hides the form, and navigates to its url", function() {
          spyOn(Application, 'showPage');

          newElectionForm.body.val("What are you doing saturday night?");
          newElectionForm.details.val("I am very lonely.");
          newElectionForm.form.submit();

          expect(Server.creates.length).toBe(1);

          var createdElection = Server.lastCreate.record;
          expect(createdElection.organization()).toBe(organization);
          expect(createdElection.body()).toBe("What are you doing saturday night?");
          expect(createdElection.details()).toBe("I am very lonely.");

          Server.lastCreate.simulateSuccess();

          expect(newElectionForm).toBeHidden();
          expect(Path.routes.current).toBe(createdElection.url());
        });
      });

      describe("when the body field is blank", function() {
        it("does not create an election or hide the form", function() {
          newElectionForm.body.val("    ");
          newElectionForm.form.submit();
          expect(Server.creates.length).toBe(0);
          expect(newElectionForm).toBeVisible();
        });
      });

      describe("when the body field exceeds 140 characters", function() {

        it("does not create the election or hide the form", function() {
          var longBody = ""
          _.times(141, function() {
            longBody += "X"
          });
          newElectionForm.body.val(longBody);
          newElectionForm.form.submit();
          expect(Server.creates.length).toBe(0);
          expect(newElectionForm).toBeVisible();
        });
      });

    });
    
    describe("when the current user is a guest", function() {
      beforeEach(function() {
        Application.currentUser(guest);
      });
      
      describe("when the user logs in / signs up at the prompt", function() {
        it("creates the question and navigates to it", function() {
          newElectionForm.body.val("What is your favorite vegatable?");
          newElectionForm.form.submit();
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
          newElectionForm.body.val("What is your favorite vegatable?");
          newElectionForm.details.val("mine's chard.");
          newElectionForm.form.submit();
          expect(Server.creates.length).toBe(0);
          expect(Application.signupForm).toBeVisible();
          Application.signupForm.close();
          expect(Server.creates.length).toBe(0);
          expect(newElectionForm).toBeVisible();
          expect(Application.darkenedBackground).toBeVisible();
          expect(newElectionForm.body.val()).toBe("What is your favorite vegatable?");
          expect(newElectionForm.details.val()).toBe("mine's chard.");
        });
      });
    });
  });

  describe("when the form is shown", function() {
    it("focuses the textarea", function() {
      expect(newElectionForm.body).toHaveFocus();
    });

    it("clears out the old text from previous showings", function() {
      newElectionForm.body.val("Junk");
      newElectionForm.details.val("Garbage");
      newElectionForm.close();
      newElectionForm.show();
      expect(newElectionForm.body.val()).toBe("");
      expect(newElectionForm.details.val()).toBe("");
    });
  });

  describe("when typing in the body", function() {
    it("adjusts the chars remaining", function() {
      newElectionForm.body.val("123")
      newElectionForm.body.keyup();
      expect(newElectionForm.charsRemaining.text()).toBe('137');
    });
  });

  describe("when enter is pressed in the body textarea", function() {
    it("submits the form", function() {
      newElectionForm.body.val("What's your favorite kinda cheese?");
      newElectionForm.body.trigger({ type : 'keydown', which : 13 });

      expect(Server.creates.length).toBe(1);

    });
  });
});

