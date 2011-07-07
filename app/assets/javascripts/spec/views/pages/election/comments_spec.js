//= require spec/spec_helper

describe("Views.Pages.Election.Comments", function() {
  var member, election, comment1, comment2, creator1, creator2, commentsRelation, commentsView, longCommentBody;

  beforeEach(function() {
    attachLayout();
    member = User.createFromRemote({id: 1});
    Application.currentUser(member);

    election = Election.createFromRemote({id: 22, creatorId: 1, createdAt: 234});
    creator1 = User.createFromRemote({id: 1, firstName: "Commento", lastName: "Santiago"});
    creator2 = User.createFromRemote({id: 2, firstName: "Kommentor", lastName: "Brunsfeld"});
    comment1 = election.comments().createFromRemote({id: 11, body: "I likeah the fruiloops so much", creatorId: creator1.id(), createdAt: 3245});
    comment2 = election.comments().createFromRemote({id: 12, body: "Yez but sie koko krispies sind sehr yummy", creatorId: creator2.id(), createdAt: 3295});

    spyOn(ElectionComment.prototype, 'editableByCurrentUser').andReturn(true);

    commentsView = Views.Pages.Election.Comments.toView();
    commentsRelation = election.comments();

    $('#jasmine_content').html(commentsView);
    commentsView.width(800);
    commentsView.height(300);
    commentsView.attach();
    commentsView.comments(commentsRelation);

    longCommentBody = ""
    for (var i = 0; i < 20; i++) {
      longCommentBody += "Coocoo for cocoa puffs!!! Coocoo!! Ahh!! "
    }
  });

  describe("when the comments relation is assigned", function() {
    it("assigns the relation on its list", function() {
      expect(commentsView.list.relation().tuples()).toEqual(commentsRelation.tuples());
    });
  });

  describe("comment creation", function() {
    beforeEach(function() {
      useFakeServer();
    });

    describe("when the current user is a member", function() {
      describe("when the create comment button is clicked", function() {
        it("clears the textarea, resizes it and submits a comment to the server", function() {
          var originalTextareaHeight = commentsView.textarea.height();

          commentsView.textarea.val(longCommentBody);
          commentsView.textarea.keyup(); // trigger elastic
          expect(commentsView.textarea.height()).toBeGreaterThan(originalTextareaHeight);


          commentsView.createButton.click();
          expect(commentsView.textarea.val()).toBe('');
          expect(commentsView.textarea.height()).toBe(originalTextareaHeight);

          expect(Server.creates.length).toBe(1);

          var createdRecord = Server.lastCreate.record;

          expect(createdRecord.body()).toBe(longCommentBody);
          expect(createdRecord.electionId()).toBe(election.id());
        });
      });

      describe("when enter is pressed within the comment", function() {
        it("clears the textarea and submits a comment to the server", function() {
          commentsView.textarea.val("I like to eat stamps!");
          commentsView.textarea.trigger({ type : 'keydown', which : 13 });
          expect(commentsView.textarea.val()).toBe('');
          expect(Server.creates.length).toBe(1);

          var createdRecord = Server.lastCreate.record;

          expect(createdRecord.body()).toBe("I like to eat stamps!");
          expect(createdRecord.electionId()).toBe(election.id());
        });

        it("does nothing if the textarea is blank", function() {
          commentsView.textarea.val("   ");
          commentsView.textarea.trigger({ type : 'keydown', which : 13 });
          expect(Server.creates).toBeEmpty();
        });
      });
    });

    describe("when the current user is a guest", function() {
      var guest;
      beforeEach(function() {
        guest = User.createFromRemote({id: 2, guest: true});
        Application.currentUser(guest);
        commentsView.detach();
        $('#jasmine_content').html(Application);
      });

      describe("when the user signs up / logs in at the prompt", function() {
        it("creates the comment and clears the field", function() {
          commentsView.textarea.val("I like to eat stamps!");
          commentsView.textarea.trigger({ type : 'keydown', which : 13 });

          expect(Server.creates.length).toBe(0);
          expect(Application.signupForm).toBeVisible();
          Application.signupForm.firstName.val("Dude");
          Application.signupForm.lastName.val("Richardson");
          Application.signupForm.emailAddress.val("dude@example.com");
          Application.signupForm.password.val("wicked");
          Application.signupForm.form.submit();
          expect($.ajax).toHaveBeenCalled();

          $.ajax.mostRecentCall.args[0].success({ current_user_id: member.id() });

          expect(commentsView.textarea.val()).toBe('');
          expect(Server.creates.length).toBe(1);
          var createdRecord = Server.lastCreate.record;
          expect(createdRecord.body()).toBe("I like to eat stamps!");
          expect(createdRecord.electionId()).toBe(election.id());
        });
      });

      describe("when the user cancels at the prompt", function() {
        it("does not create the comment or clear out the field", function() {
          commentsView.textarea.val("I like to eat stamps!");
          commentsView.textarea.trigger({ type : 'keydown', which : 13 });

          expect(Server.creates.length).toBe(0);
          expect(Application.signupForm).toBeVisible();
          Application.signupForm.close();

          expect(Server.creates.length).toBe(0);
          expect(commentsView.textarea.val()).toBe("I like to eat stamps!");
        });
      });
    });
  });
  
  describe("rendering", function() {
    describe("enabling / disabling of 'full-height' mode", function() {
      describe("when comments are inserted and removed", function() {
        it("enables full-height mode to avoid overflow and disables it if no longer needed", function() {
          expect(commentsView).not.toHaveClass('full-height');
          var longComment = commentsRelation.createFromRemote({id: 13, body: longCommentBody, creatorId: creator1.id(), createdAt: 2345234})
          expect(commentsView).toHaveClass('full-height');
          expectListScrolledToBottom();
          longComment.remotelyDestroyed();
          expect(commentsView).not.toHaveClass('full-height');
          expectListScrolledToBottom();
        });
      });

      function expectListScrolledToBottom() {
        var list = commentsView.list;
        expect(list.attr('scrollTop') + list.height()).toBe(list.attr('scrollHeight'));
      }
    });

    describe("when the textarea resizes in full height mode", function() {
      it("adjusts the bottom of the list so its always above the textarea", function() {
        var longComment = commentsRelation.createFromRemote({id: 13, body: longCommentBody, creatorId: creator1.id(), createdAt: 2345234})
        expect(commentsView).toHaveClass('full-height');

        commentsView.textarea.val(longCommentBody);
        commentsView.textarea.keyup();

        var list = commentsView.list;
        var listBottom = list.position().top + list.height();
        expect(listBottom).toBeLessThan(commentsView.textareaAndButton.position().top);
      });
    });
  });

  describe("loading", function() {
    it("hides the view if loading, shows it otherwise", function() {
      expect(commentsView).toBeVisible();
      commentsView.loading(true);
      expect(commentsView).toBeHidden();

      commentsView.loading(false);
      expect(commentsView).toBeVisible();
    });
  });
});
