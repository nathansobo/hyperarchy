//= require spec/spec_helper

describe("Views.Pages.Question.AnswerDetails", function() {
  var answerDetails, answer, creator, question, organization;

  beforeEach(function() {
    renderLayout();
    Application.height(1000);

    answerDetails = Application.questionPage.answerDetails;
    organization = Organization.createFromRemote({id: 42});
    creator = organization.makeMember({id: 999, emailHash: 'blas', firstName: "Mr.", lastName: "Creator"});
    Application.currentUser(creator);
    question = organization.questions().createFromRemote({id: 1, creatorId: 999, createdAt: 12});
    answer = creator.answers().createFromRemote({id: 1, questionId: 1, body: "Mustard.", details: "Pardon me. Do you have any Gray Poupon?", createdAt: 1308352736162});

    Application.questionPage.show();
    Application.questionPage.showAnswerDetails();

    answerDetails.answer(answer);
  });

  describe("when the answer is assigned", function() {
    it("populates the body, details, and avatar", function() {
      expect(answerDetails.body.html()).toEqual($.markdown(answer.body()));
      expect(answerDetails.details.html()).toEqual($.markdown(answer.details()));
      answer.remotelyUpdated({body: "Catsup", details: "37 flavors"});
      expect(answerDetails.body.html()).toEqual($.markdown(answer.body()));
      expect(answerDetails.details.html()).toEqual($.markdown(answer.details()));
      expect(answerDetails.avatar.user()).toBe(answer.creator());
      expect(answerDetails.creatorName.text()).toBe(creator.fullName());
      expect(answerDetails.createdAt.text()).toBe(answer.formattedCreatedAt());
    });

    it("removes subscriptions to the previous answer", function() {
      var answer2 = Answer.createFromRemote({id: 57, body: "soup.", questionId: question.id(), createdAt: 1111, creatorId: creator.id()});
      var subscriptionsBefore = answer.onDestroyNode.size();

      answerDetails.answer(answer2);

      expect(answer.onDestroyNode.size()).toBe(subscriptionsBefore - 1);

      spyOn(History, 'pushState');
      answer.remotelyDestroyed();
      expect(History.pushState).not.toHaveBeenCalled();
    });

    it("hides the form if it is showing, even if the answer does not change", function() {
      answerDetails.answer(answer);

      answerDetails.editButton.click();

      expect(answerDetails.form).toBeVisible();
      expect(answerDetails.nonEditableContent).toBeHidden();

      answerDetails.answer(answer);

      expect(answerDetails.form).toBeHidden();
      expect(answerDetails.nonEditableContent).toBeVisible();
    });

    it("handles null answers", function() {
      answerDetails.answer(null);
    });
  });

  describe("showing and hiding of the edit and destroy buttons", function() {
    var currentUserCanEdit;
    beforeEach(function() {
      spyOn(Answer.prototype, 'editableByCurrentUser').andCallFake(function() {
        return currentUserCanEdit;
      });
    });

    describe("on answer assignment", function() {
      it("shows the edit link only if the current user can edit", function() {
        var otherAnswer = question.answers().createFromRemote({id: 100, creatorId: creator.id(), createdAt: 234234});

        currentUserCanEdit = false;
        answerDetails.answer(otherAnswer);
        expect(answerDetails).not.toHaveClass('mutable');
        expect(answerDetails.editButton).toBeHidden();
        expect(answerDetails.destroyButton).toBeHidden();


        currentUserCanEdit = true;
        answerDetails.answer(answer);
        expect(answerDetails).toHaveClass('mutable');
        expect(answerDetails.editButton).toBeVisible();
        expect(answerDetails.destroyButton).toBeVisible();
      });
    });

    describe("on user switch", function() {
      it("shows the edit button only when the current user is the creator of the answer, an owner of the organization, or an admin", function() {
        var otherUser = User.createFromRemote({id: 123});

        currentUserCanEdit = false;
        Application.currentUser(otherUser);
        expect(answerDetails.editButton).toBeHidden();
        expect(answerDetails.destroyButton).toBeHidden();

        currentUserCanEdit = true;
        Application.currentUser(creator);
        expect(answerDetails.editButton).toBeVisible();
        expect(answerDetails.destroyButton).toBeVisible();
      });
    });
  });

  describe("handling of long details", function() {
    var longDetails = "It is ", longAnswer;

    beforeEach(function() {
      _.times(100, function() { longDetails += "so " });
      longDetails += "good.";
      longAnswer = creator.answers().createFromRemote({id: 1, questionId: 1, body: "Sourkraut", details: longDetails, createdAt: 1308352736162});
    });

    describe("when an answer is assigned or updated", function() {
      it("truncates the details and shows and hides the expand button as appropriate", function() {
        expect(answerDetails.expandedDetails).toBeHidden();
        expect(answerDetails.details).toBeVisible();

        // assign answer w/ long details
        answerDetails.answer(longAnswer);

        expect(answerDetails.moreLink).toBeVisible();
        expect(answerDetails.details.text()).toContain(longAnswer.details().substring(0, 100));
        expect(answerDetails.details.text()).toContain("…");

        // update answer w/ short details
        longAnswer.remotelyUpdated({details: "I like it."});

        expect(answerDetails.moreLink).toBeHidden();
        expect(answerDetails.details.text()).toContain(longAnswer.details());
        expect(answerDetails.details.text()).not.toContain("…");

        // update answer w/ long details
        longDetails = "I just ";
        _.times(100, function() { longDetails += "really " });
        longDetails += "love it.";
        longAnswer.remotelyUpdated({details: longDetails});

        expect(answerDetails.moreLink).toBeVisible();
        expect(answerDetails.details.text()).toContain(longAnswer.details().substring(0, 100));
        expect(answerDetails.details.text()).toContain("…");

        // assign answer w/ short details
        answerDetails.answer(answer);

        expect(answerDetails.moreLink).toBeHidden();
        expect(answerDetails.details.text()).toContain(answer.details());
        expect(answerDetails.details.text()).not.toContain("…");
      });

      it("exits expanded mode when a different answer is assigned", function() {
        answerDetails.answer(answer);
        answerDetails.moreLink.click();

        answerDetails.answer(longAnswer);

        expect(answerDetails.details).toBeVisible();
        expect(answerDetails.moreLink).toBeVisible();
        expect(answerDetails.expandedDetails).toBeHidden();
        expect(answerDetails.lessLink).toBeHidden();
        expect(answerDetails).not.toHaveClass('expanded');
      });
    });
    
    describe("when the 'more' and 'less' buttons are clicked", function() {
      it("switches between the expanded and non-expanded details, and shows and hides the 'more' and 'less' buttons as appropriate", function() {
        answerDetails.answer(longAnswer);

        expect(answerDetails.details).toBeVisible();
        expect(answerDetails.moreLink).toBeVisible();
        expect(answerDetails.expandedDetails).toBeHidden();
        expect(answerDetails.lessLink).toBeHidden();

        answerDetails.moreLink.click();

        expect(answerDetails.details).toBeHidden();
        expect(answerDetails.moreLink).toBeHidden();
        expect(answerDetails.expandedDetails).toBeVisible();
        expect(answerDetails.lessLink).toBeVisible();
        expect(answerDetails).toHaveClass('expanded');

        answerDetails.lessLink.click();

        expect(answerDetails.details).toBeVisible();
        expect(answerDetails.moreLink).toBeVisible();
        expect(answerDetails.expandedDetails).toBeHidden();
        expect(answerDetails.lessLink).toBeHidden();
        expect(answerDetails).not.toHaveClass('expanded');

        // when you contract after the answer gets shorter in background while expanded, the expand button is hidden
        answerDetails.moreLink.click();
        longAnswer.remotelyUpdated({details: "I like it."});
        answerDetails.lessLink.click();
        expect(answerDetails.moreLink).toBeHidden();
        expect(answerDetails.lessLink).toBeHidden();
      });
    });
  });

  describe("showing and hiding the new form", function() {
    it("hides comments and empties out and shows the form fields & create button when #showNewForm is called", function() {
      answerDetails.editableBody.val("woweee!");
      answerDetails.editableDetails.val("cocooo!");
      answerDetails.cancelEdit();

      var now = new Date();
      spyOn(window, 'Date').andReturn(now);

      expect(answerDetails.createButton).toBeHidden();
      answerDetails.showNewForm();
      expect(answerDetails.form).toBeVisible();
      expect(answerDetails.editableBody.val()).toBe('');
      expect(answerDetails.editableDetails.val()).toBe('');
      expect(answerDetails.charsRemaining.text()).toBe('140');

      expect(answerDetails.createButton).toBeVisible();
      expect(answerDetails.cancelEditButton).toBeHidden();
      expect(answerDetails.updateButton).toBeHidden();
      expect(answerDetails.comments).toBeHidden();

      expect(answerDetails.avatar.user()).toBe(Application.currentUser());
      expect(answerDetails.creatorName.text()).toBe(Application.currentUser().fullName());
      expect(answerDetails.createdAt.text()).toBe($.PHPDate("M j, Y @ g:ia", now));

      answerDetails.answer(answer);

      expect(answerDetails.form).toBeHidden();
      expect(answerDetails.createButton).toBeHidden();
      expect(answerDetails.cancelEditButton).toBeHidden();
      expect(answerDetails.updateButton).toBeHidden();
      expect(answerDetails.comments).toBeVisible();
    });
  });

  describe("when the create button is clicked", function() {
    var fieldValues;

    beforeEach(function() {
      Application.questionPage.question(question);
      useFakeServer();
      answerDetails.showNewForm();
      fieldValues = {
        body: "Relish",
        details: "That green stuff..."
      };

      answerDetails.editableBody.val(fieldValues.body);
      answerDetails.editableDetails.val(fieldValues.details);
    });

    describe("when the current user is a member", function() {
      describe("when the body field is filled in", function() {
        it("creates a new answers with the given body and details on the server and hides the form", function() {
          answerDetails.createButton.click();

          expect(Server.creates.length).toBe(1);

          expect(Server.lastCreate.record.dirtyWireRepresentation()).toEqual(_.extend(fieldValues, {question_id: question.id()}));
          Server.lastCreate.simulateSuccess({creatorId: Application.currentUser().id()});

          expect(Path.routes.current).toBe(question.url());
        });

        it("wires the form submit event to save", function() {
          answerDetails.form.submit();
          expect(Server.updates.length).toBe(1);
        });
      });

      describe("when the body field is empty", function() {
        it("does nothing", function() {
          spyOn(History, 'pushState');
          answerDetails.editableBody.val('                  ');
          answerDetails.createButton.click();
          expect(Server.creates.length).toBe(0);
          expect(History.pushState).not.toHaveBeenCalled();
        });
      });
    });

    describe("when the current user is a guest", function() {
      var guest, member;

      beforeEach(function() {
        spyOn(answer, 'editableByCurrentUser').andReturn(true);
        guest = organization.makeMember({id: 5, guest: true});
        member = organization.makeMember({id: 6, emailAddress: "member@example.com"});
        Application.currentUser(guest);

        Application.questionPage.params({questionId: question.id(), answerId: 'new'});

        answerDetails.editableBody.val(fieldValues.body);
        answerDetails.editableDetails.val(fieldValues.details);
      });

      describe("when the guest signs up at the prompt", function() {
        it("creates the answer", function() {
          answerDetails.createButton.click();

          expect(Server.creates.length).toBe(0);
          expect(Application.signupForm).toBeVisible();
          Application.signupForm.firstName.val("Dude");
          Application.signupForm.lastName.val("Richardson");
          Application.signupForm.emailAddress.val("dude@example.com");
          Application.signupForm.password.val("wicked");
          Application.signupForm.form.submit();
          expect($.ajax).toHaveBeenCalled();

          $.ajax.mostRecentCall.args[0].success({ current_user_id: member.id() });
          Server.lastFetch.simulateSuccess(); // fetch member's rankings

          expect(Server.creates.length).toBe(1);

          var createdAnswer = Server.lastCreate.record;

          expect(createdAnswer.question()).toBe(question);
          expect(createdAnswer.body()).toBe(fieldValues.body);
          expect(createdAnswer.details()).toBe(fieldValues.details);

          Server.lastCreate.simulateSuccess({creatorId: Application.currentUser().id()});

          expect(Path.routes.current).toBe(question.url());
        });
      });

      describe("when the guest logs in", function() {
        it("creates the answer", function() {
          answerDetails.createButton.click();

          expect(Server.creates.length).toBe(0);
          expect(Application.signupForm).toBeVisible();
          Application.signupForm.loginFormLink.click();

          // simulate login
          Application.loginForm.emailAddress.val("member@example.com");
          Application.loginForm.password.val("password");
          Application.loginForm.form.submit();
          expect($.ajax).toHaveBeenCalled();
          $.ajax.mostRecentCall.args[0].success({ current_user_id: member.id() });
          Server.lastFetch.simulateSuccess(); // fetch new user rankings

          expect(Server.creates.length).toBe(1);

          var createdAnswer = Server.lastCreate.record;

          expect(createdAnswer.question()).toBe(question);
          expect(createdAnswer.body()).toBe(fieldValues.body);
          expect(createdAnswer.details()).toBe(fieldValues.details);

          Server.lastCreate.simulateSuccess({creatorId: Application.currentUser().id()});

          expect(Path.routes.current).toBe(question.url());
        });
      });
    });
  });
  
  describe("handling of the enter key on the body textarea", function() {
    beforeEach(function() {
      Application.questionPage.question(question);
      useFakeServer();
    });

    it("creates the answer when the new form is showing", function() {
      answerDetails.showNewForm();
      answerDetails.editableBody.val("Blah");
      answerDetails.editableBody.trigger({ type : 'keydown', which : 13 });
      expect(Server.creates.length).toBe(1);
    });

    it("updates the answer when the edit form is showing", function() {
      answerDetails.editButton.click();
      answerDetails.editableBody.val("Blah");
      answerDetails.editableBody.trigger({ type : 'keydown', which : 13 });
      expect(Server.updates.length).toBe(1);
    });
  });

  describe("showing and hiding of the edit form", function() {
    it("shows and populates the form fields and sets focus when edit is clicked and hides them when cancel is clicked", function() {
      expect(answerDetails.form).toBeHidden();
      expect(answerDetails.nonEditableContent).toBeVisible();

      answerDetails.editButton.click();

      expect(answerDetails.form).toBeVisible();
      expect(answerDetails.updateButton).toBeVisible();
      expect(answerDetails.cancelEditButton).toBeVisible();
      expect(answerDetails.nonEditableContent).toBeHidden();

      expect(answerDetails.editableBody.val()).toBe(answer.body());
      expect(answerDetails.editableBody[0]).toBe(document.activeElement);
      expect(answerDetails.charsRemaining.text()).toBe((140 - answer.body().length).toString());
      expect(answerDetails.editableDetails.val()).toBe(answer.details());
      expect(answerDetails.expanded()).toBeTruthy();

      answerDetails.cancelEditButton.click();

      expect(answerDetails.form).toBeHidden();
      expect(answerDetails.updateButton).toBeHidden();
      expect(answerDetails.cancelEditButton).toBeHidden();
      expect(answerDetails.nonEditableContent).toBeVisible();
      expect(answerDetails.expanded()).toBeFalsy();
    });

    it("does not show the comments if they are still loading", function() {
      answerDetails.comments.loading(true);
      answerDetails.editButton.click();
      answerDetails.cancelEditButton.click();
      expect(answerDetails.comments).toBeHidden();
    });
  });

  describe("when the update button is clicked", function() {
    var fieldValues;

    beforeEach(function() {
      useFakeServer();
      answerDetails.editButton.click();
      fieldValues = {
        body: "Relish",
        details: "That green stuff..."
      }

      answerDetails.editableBody.val(fieldValues.body);
      answerDetails.editableDetails.val(fieldValues.details);
    });

    it("updates the record's body and details on the server and hides the form", function() {
      answerDetails.updateButton.click();
  
      expect(Server.updates.length).toBe(1);

      expect(Server.lastUpdate.dirtyFieldValues).toEqual(fieldValues);
      Server.lastUpdate.simulateSuccess();

      expect(answerDetails.form).toBeHidden();
      expect(answerDetails.nonEditableContent).toBeVisible();
      
      expect(answerDetails.body.text()).toBe(fieldValues.body);
      expect(answerDetails.details.text()).toBe(fieldValues.details);
    });

    it("wires the form submit event to save", function() {
      answerDetails.form.submit();
      expect(Server.updates.length).toBe(1);
    });

    it("does not allow a blank body", function() {
      spyOn(History, 'pushState');
      answerDetails.editableBody.val('  ');
      answerDetails.updateButton.click();
      expect(Server.updates.length).toBe(0);
      expect(History.pushState).not.toHaveBeenCalled();
    });

    it("does not allow a body exceeding 140 chars", function() {
      var longBody = ""
      _.times(141, function() {
        longBody += "X"
      });

      spyOn(History, 'pushState');
      answerDetails.editableBody.val(longBody);
      answerDetails.updateButton.click();
      expect(Server.updates.length).toBe(0);
      expect(History.pushState).not.toHaveBeenCalled();
    });
  });

  describe("when the destroy button is clicked", function() {
    beforeEach(function() {
      useFakeServer();
    });

    describe("if the user accepts the confirmation", function() {
      it("deletes the answer", function() {
        spyOn(window, 'confirm').andReturn(true);

        answerDetails.destroyButton.click();

        expect(Server.destroys.length).toBe(1);
        expect(Server.lastDestroy.record).toBe(answer);
      });
    });

    describe("if the user rejects the confirmation", function() {
      it("does not delete the answer", function() {
        spyOn(window, 'confirm').andReturn(false);

        answerDetails.destroyButton.click();

        expect(Server.destroys.length).toBe(0);
      });
    });
  });

  describe("when the answer is destroyed", function() {
    it("navigates to the question url", function() {
      answer.remotelyDestroyed();
      expect(Path.routes.current).toBe(question.url());
    });
  });
  
  describe("adjustment of the comments height", function() {
    var longText;

    beforeEach(function() {
      longText = "";
      for (var i = 0; i < 10; i++) longText += "Bee bee boo boo ";
    });

    describe("when the details/body are assigned and when they change", function() {
      it("adjusts the comments to fill the remaining available height", function() {
        Application.questionPage.showAnswerDetails();
        expectCommentsToHaveFullHeight();

        answer.remotelyUpdated({body: longText});
        expectCommentsToHaveFullHeight();

        answer.remotelyUpdated({details: longText});
        expectCommentsToHaveFullHeight();
      });
    });

    describe("when the window is resized", function() {
      it("adjusts the comments to fill the remaining available height", function() {
        Application.questionPage.width(1200);
        answer.remotelyUpdated({details: longText});

        Application.questionPage.width(800);
        $(window).resize();
        expectCommentsToHaveFullHeight();
      });
    });

    function expectCommentsToHaveFullHeight() {
      var commentsBottom = answerDetails.comments.position().top + answerDetails.comments.outerHeight();
      expect(commentsBottom).toBe(answerDetails.outerHeight() - parseInt(answerDetails.css('padding-bottom')));
    }
  });

  describe("loading", function() {
    it("assigns loading to the comments", function() {
      answerDetails.loading(true);
      expect(answerDetails.comments.loading()).toBeTruthy();
      answerDetails.loading(false);
      expect(answerDetails.comments.loading()).toBeFalsy();
    });
  });

  describe("mixpanel tracking", function() {
    beforeEach(function() {
      useFakeServer();
      mpq = [];
    });

    describe("when the answer is assigned", function() {
      beforeEach(function() {
        answerDetails.answer(null);
      });

      it("pushes a 'view answer' event to the mixpanel queue", function() {
        answerDetails.answer(answer);
        expect(mpq.length).toBe(1);
        var event = mpq.pop();
        expect(event[0]).toBe('track');
        expect(event[1]).toBe('View Answer');
      });
    });

    describe("when an answer is created", function() {
      beforeEach(function() {
        Application.questionPage.question(question);
        answerDetails.showNewForm();
        answerDetails.editableBody.val("muesli");
        answerDetails.editableDetails.val("non-vegan, plz");
        mpq = [];
      });

      it("pushes a 'create answer' event to the mixpanel queue", function() {
        answerDetails.createButton.click();
        Server.lastCreate.simulateSuccess({creatorId: Application.currentUser().id()});

        expect(mpq.length).toBe(1);
        var event = mpq.pop();
        expect(event[0]).toBe('track');
        expect(event[1]).toBe('Create Answer');
      });
    });

    describe("when an answer is updated", function() {
      it("pushes an 'update answer' event to the mixpanel queue", function() {
        answerDetails.editButton.click();
        answerDetails.editableBody.val("i have changed my mind.");
        answerDetails.updateButton.click();
        Server.lastUpdate.simulateSuccess();

        expect(mpq.length).toBe(1);
        var event = mpq.pop();
        expect(event[0]).toBe('track');
        expect(event[1]).toBe('Update Answer');
      });
    });
  });
});
