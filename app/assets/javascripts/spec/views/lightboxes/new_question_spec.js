//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

describe("Views.Lightboxes.NewQuestion", function() {
  var newQuestionForm, organization, member, guest;
  beforeEach(function() {
    renderLayout();
    organization = Organization.createFromRemote({id: 1, privacy: "public"});
    member = organization.makeMember({id: 1});
    guest =  organization.makeMember({id: 2, guest: true});
    Application.currentUser(member);
    Application.currentOrganization(organization);
    useFakeServer();

    newQuestionForm = Application.newQuestion.show();
    newQuestionForm.shareOnFacebook.attr('checked', false);
  });

  describe("when the form is submitted", function() {
    beforeEach(function() {
      spyOn(Application, 'showPage');
    });

    describe("when the 'share on facebook' box is checked", function() {
      beforeEach(function() {
        spyOn(FB, 'login');
        newQuestionForm.shareOnFacebook.attr('checked', true);
        useFakeServer();
      });

      describe("when the user successfully logs into facebook", function() {
        it("creates the question and posts it to the user's facebook feed", function() {
          newQuestionForm.body.val("Should I use facebook or diaspora?");
          newQuestionForm.submit.click();

          expect(FB.login).toHaveBeenCalled();
          expect(FB.login.mostRecentCall.args[1].perms).toContain("email");
          var callback = FB.login.mostRecentCall.args[0];
          callback({session: {}});

          expect(Server.creates.length).toBe(1);
          var question = Server.lastCreate.record;
          spyOn(question, 'shareOnFacebook');

          Server.lastCreate.simulateSuccess({creatorId: Application.currentUserId()});
          expect(question.shareOnFacebook).toHaveBeenCalled();
        });
      });

      describe("when the user does not successfully log into facebook", function() {
        describe("if the user is a guest", function() {
          beforeEach(function() {
            Application.currentUser(guest);
          });

          it("does not create the question and prompts them for normal signup", function() {
            newQuestionForm.body.val("Should I use facebook or diaspora?");
            newQuestionForm.submit.click();

            expect(FB.login).toHaveBeenCalled();
            var callback = FB.login.mostRecentCall.args[0];
            callback({session: null});

            expect(Application.signupForm).toBeVisible();
            expect(Server.creates).toBeEmpty();

            // simulate successful signin
            Application.currentUser(member);
            Application.signupForm.trigger('success');

            expect(Server.creates.length).toBe(1);
            var record = Server.lastCreate.record;
            expect(record.body()).toBe("Should I use facebook or diaspora?");

            Server.lastCreate.simulateSuccess({creatorId: Application.currentUserId()});
            expect(Path.routes.current).toBe(record.url());
          });
        });

        describe("if the user is a member", function() {
          it("creates the question and does not post it to facebook", function() {
            newQuestionForm.body.val("Should I use facebook or diaspora?");
            newQuestionForm.submit.click();

            expect(FB.login).toHaveBeenCalled();
            var callback = FB.login.mostRecentCall.args[0];
            callback({session: null});

            expect(Server.creates.length).toBe(1);
            var record = Server.lastCreate.record;
            expect(record.body()).toBe("Should I use facebook or diaspora?");
            spyOn(record, 'shareOnFacebook')

            Server.lastCreate.simulateSuccess({creatorId: Application.currentUserId()});
            expect(record.shareOnFacebook).not.toHaveBeenCalled();
            expect(Path.routes.current).toBe(record.url());
          });
        });
      });
    });

    describe("when the 'share on facebook' box is NOT checked", function() {
      describe("when the current user is a member", function() {
        describe("when the body field is not blank", function() {
          it("creates a question, hides the form, and navigates to its url", function() {

            newQuestionForm.body.val("What are you doing saturday night?");
            newQuestionForm.details.val("I am very lonely.");
            newQuestionForm.form.submit();

            expect(Server.creates.length).toBe(1);

            var createdQuestion = Server.lastCreate.record;
            expect(createdQuestion.organization()).toBe(organization);
            expect(createdQuestion.body()).toBe("What are you doing saturday night?");
            expect(createdQuestion.details()).toBe("I am very lonely.");

            Server.lastCreate.simulateSuccess({creatorId: Application.currentUserId()});

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

            Server.lastCreate.simulateSuccess({creatorId: Application.currentUserId()});
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

    it("only shows the checkbox if the current organization is public, otherwise it hides it and unchecks it", function() {
      expect(newQuestionForm.shareOnFacebook).toBeVisible();
      newQuestionForm.close();

      organization.remotelyUpdated({privacy: "private"});
      newQuestionForm.show();

      expect(newQuestionForm.shareOnFacebook.attr('checked')).toBeFalsy();
      expect(newQuestionForm.shareOnFacebook).toBeHidden();
      newQuestionForm.close();

      organization.remotelyUpdated({privacy: "public"});
      newQuestionForm.show();
      expect(newQuestionForm.shareOnFacebook.attr('checked')).toBeTruthy();
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

  describe("mixpanel tracking", function() {
    describe("when the form is submitted", function() {
      beforeEach(function() {
        spyOn(Application, 'showPage');
        mpq = [];
      });

      it("pushes a 'create question' event to the mixpanel queue", function() {
        newQuestionForm.body.val("What are you doing saturday night?");
        newQuestionForm.details.val("I am very lonely.");
        newQuestionForm.form.submit();
        Server.lastCreate.simulateSuccess({creatorId: Application.currentUserId()});

        expect(mpq.length).toBe(1);
        var event = mpq.pop();
        expect(event[0]).toBe('track');
        expect(event[1]).toBe('Create Question');
      });
    });
  });
});

