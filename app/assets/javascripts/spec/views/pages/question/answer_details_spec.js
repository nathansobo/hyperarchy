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
      expect(answerDetails.body.text()).toEqual(answer.body());
      expect(answerDetails.details.text()).toEqual(answer.details());
      answer.remotelyUpdated({body: "Catsup", details: "37 flavors"});
      expect(answerDetails.body.text()).toEqual(answer.body());
      expect(answerDetails.details.text()).toEqual(answer.details());
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
        var otherAnswer = Answer.createFromRemote({id: 100, creatorId: creator.id(), createdAt: 234234});

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
          Server.lastCreate.simulateSuccess();

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
        member = organization.makeMember({id: 6});
        Application.currentUser(guest);

        answerDetails.show();
        answerDetails.showNewForm();
        answerDetails.editableBody.val(fieldValues.body);
        answerDetails.editableDetails.val(fieldValues.details);
      });

      it("prompts for signup, and creates a answer only if they sign up", function() {
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

        expect(Server.creates.length).toBe(1);

        var createdAnswer = Server.lastCreate.record;

        expect(createdAnswer.question()).toBe(question);
        expect(createdAnswer.body()).toBe(fieldValues.body);
        expect(createdAnswer.details()).toBe(fieldValues.details);

        Server.lastCreate.simulateSuccess();

        expect(Path.routes.current).toBe(question.url());
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

      answerDetails.cancelEditButton.click();

      expect(answerDetails.form).toBeHidden();
      expect(answerDetails.updateButton).toBeHidden();
      expect(answerDetails.cancelEditButton).toBeHidden();
      expect(answerDetails.nonEditableContent).toBeVisible();
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
      spyOn(answerDetails.comments, 'adjustHeightAndScroll');
    });

    describe("when the details/body are assigned and when they change", function() {
      it("adjusts the comments to fill the remaining available height", function() {
        Application.questionPage.showAnswerDetails();
        expectCommentsToHaveFullHeight();

        answer.remotelyUpdated({body: longText});
        expectCommentsToHaveFullHeight();

        answer.remotelyUpdated({details: longText});
        expectCommentsToHaveFullHeight();
        expect(answerDetails.comments.adjustHeightAndScroll).toHaveBeenCalled();
      });
    });

    describe("when the form is shown and hidden", function() {
      it("adjusts the comments to fill the remaining available height", function() {
        answerDetails.editButton.click();
        expectCommentsToHaveFullHeight();
        
        answerDetails.cancelEditButton.click();
        expectCommentsToHaveFullHeight();
        expect(answerDetails.comments.adjustHeightAndScroll).toHaveBeenCalled();
      });
    });

    describe("when the window is resized", function() {
      it("adjusts the comments to fill the remaining available height", function() {
        Application.questionPage.width(1200);
        answer.remotelyUpdated({details: longText});

        Application.questionPage.width(800);
        $(window).resize();
        expectCommentsToHaveFullHeight();
        expect(answerDetails.comments.adjustHeightAndScroll).toHaveBeenCalled();
      });
    });

    describe("when the body or details textareas resize elastically", function() {
      it("adjusts the comments to fill the remaining available height", function() {
        answerDetails.editButton.click();

        answerDetails.editableBody.val(longText);
        answerDetails.editableBody.keyup();
        expectCommentsToHaveFullHeight();

        answerDetails.editableDetails.val(longText);
        answerDetails.editableDetails.keyup();

        expectCommentsToHaveFullHeight();
        expect(answerDetails.comments.adjustHeightAndScroll).toHaveBeenCalled();
      });
    });

    function expectCommentsToHaveFullHeight() {
      var commentsBottom = answerDetails.comments.position().top + answerDetails.comments.outerHeight();
      expect(commentsBottom).toBe(answerDetails.outerHeight() - parseInt(answerDetails.css('padding-bottom')));
    }
  });

  describe("when the close link is clicked", function() {
    beforeEach(function() {
      Application.questionPage.question(question);
    });

    describe("when the view is in 'new' mode", function() {
      it("routes to the question's url", function() {
        Application.questionPage.question(question);
        answerDetails.answer(null);
        answerDetails.showNewForm();
        spyOn(Application, 'showPage');
        answerDetails.closeLink.click();
        expect(Path.routes.current).toBe(question.url());
      });
    });

    describe("when the view is in 'details' mode", function() {
      it("routes to the question's url", function() {
        spyOn(Application, 'showPage');
        answerDetails.closeLink.click();
        expect(Path.routes.current).toBe(question.url());
      });
    });
  });

  describe("loading", function() {
    it("assigns loading to the comments", function() {
      answerDetails.loading(true);
      expect(answerDetails.comments.loading()).toBeTruthy();
      answerDetails.loading(false);
      expect(answerDetails.comments.loading()).toBeFalsy();
    });
  });
});
