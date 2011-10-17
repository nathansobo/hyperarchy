//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

describe("Views.Pages.Question.Comments", function() {
  var member, question, comment1, comment2, creator1, creator2, commentsRelation, commentsView, longCommentBody;

  beforeEach(function() {
    attachLayout();
    member = User.createFromRemote({id: 1});
    Application.currentUser(member);

    question = Question.createFromRemote({id: 22, creatorId: 1, createdAt: 234});
    creator1 = User.createFromRemote({id: 1, firstName: "Commento", lastName: "Santiago"});
    creator2 = User.createFromRemote({id: 2, firstName: "Kommentor", lastName: "Brunsfeld"});
    comment1 = question.comments().createFromRemote({id: 11, body: "I likeah the fruiloops so much", creatorId: creator1.id(), createdAt: 3245});
    comment2 = question.comments().createFromRemote({id: 12, body: "Yez but sie koko krispies sind sehr yummy", creatorId: creator2.id(), createdAt: 3295});

    spyOn(QuestionComment.prototype, 'editableByCurrentUser').andReturn(true);

    commentsView = Views.Pages.Question.Comments.toView();
    commentsRelation = question.comments();

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
        it("clears and resizes the textarea, scrolls list to bottom, and submits a comment to the server", function() {
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
          expect(createdRecord.questionId()).toBe(question.id());
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
          expect(createdRecord.questionId()).toBe(question.id());
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
          expect(createdRecord.questionId()).toBe(question.id());
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

  describe("auto-scrolling", function() {
    beforeEach(function() {
      _.times(20, function(i) {
        commentsRelation.createFromRemote({id: 100 + i, body: "This is a comment to make the thing overflow", creatorId: creator1.id(), createdAt: 12345});
      });
    });

    describe("when the user has not scrolled the comments list", function() {
      describe("when a comment is inserted/destroyed by anyone", function() {
        it("auto-scrolls to the end of the list", function() {
          var longComment = commentsRelation.createFromRemote({id: 13, body: longCommentBody, creatorId: creator1.id(), createdAt: 2345234})
          expectListScrolledToBottom();
          longComment.remotelyDestroyed();
          expectListScrolledToBottom();
        });
      });

      describe("when the height is changed", function() {
        it("auto-scrolls to the end of the list", function() {
          commentsView.height(600);
          expectListScrolledToBottom();

          commentsView.height(300);
          expectListScrolledToBottom();
        });
      });
    });

    describe("when the user has scrolled the comments list up intentionally", function() {
      var initialScrollTop;
      beforeEach(function() {
        initialScrollTop = commentsView.list.scrollTop() - 200;
        commentsView.list.scrollTop(initialScrollTop);
        commentsView.list.trigger('scroll');
      });

      describe("when a comment is inserted", function() {
        it("does not change the scroll position", function() {
          commentsRelation.createFromRemote({id: 200, body: "Another comment", creatorId: creator1.id(), createdAt: 12345});
          expect(commentsView.list.scrollTop()).toBe(initialScrollTop);
        });
      });

      describe("when the height is changed", function() {
        it("does not change the scroll position", function() {
          commentsView.height(400);
          expectListNotScrolledToBottom();
          commentsView.height(300);
          expectListNotScrolledToBottom();
        });
      });

      describe("when a comment is submitted", function() {
        it("scrolls back to the bottom and re-enables autoscroll", function() {
          useFakeServer();

          commentsView.textarea.val("We are liiiving, in a material world");
          commentsView.createButton.click();

          expectListScrolledToBottom();

          Server.lastCreate.simulateSuccess({creatorId: creator1.id(), createdAt: 12345});

          expectListScrolledToBottom();
        });
      });
    });

    describe("when the user previously scrolled up, but then scrolled back to the bottom", function() {
      beforeEach(function() {
        var list = commentsView.list;
        initialScrollTop = list.scrollTop() - 200;
        list.scrollTop(initialScrollTop);
        list.trigger('scroll');
        commentsView.scrollToBottom();
        list.trigger('scroll');
      });

      describe("when a comment is inserted/destroyed by anyone", function() {
        it("auto-scrolls to the end of the list", function() {
          var longComment = commentsRelation.createFromRemote({id: 13, body: longCommentBody, creatorId: creator1.id(), createdAt: 2345234})
          expectListScrolledToBottom();
          longComment.remotelyDestroyed();
          expectListScrolledToBottom();
        });
      });

      describe("when the height is changed", function() {
        it("auto-scrolls to the end of the list", function() {
          commentsView.height(600);
          expectListScrolledToBottom();

          commentsView.height(300);
          expectListScrolledToBottom();
        });
      });
    });

    function expectListScrolledToBottom() {
      var list = commentsView.list;
      expect(list.attr('scrollTop') + list.height()).toBe(list.attr('scrollHeight'));
    }

    function expectListNotScrolledToBottom() {
      var list = commentsView.list;
      expect(list.attr('scrollTop') + list.height()).toBeLessThan(list.attr('scrollHeight'));
    }
  });

  describe("when the textarea resizes", function() {
    it("adjusts the height of the list so it does not push the textarea beyond the height of the comments div", function() {
      var longComment = commentsRelation.createFromRemote({id: 13, body: longCommentBody, creatorId: creator1.id(), createdAt: 2345234})

      commentsView.textarea.val(longCommentBody);
      commentsView.textarea.keyup();

      var list = commentsView.list;
      var listBottom = list.position().top + list.height();
      expect(listBottom).toBeLessThan(commentsView.textareaAndButton.position().top);
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
  
  describe("#expanded(true/false)", function() {
    it("adjusts css properties to auto-expand when in expanded mode or remain contain when collapsed", function() {
      expect(commentsView.expanded()).toBeFalsy();
      commentsView.height(150);

      // when expanded, no longer contains itself in previously assigned height
      commentsView.expanded(true);
      expect(commentsView.height()).toBeGreaterThan(150);
      expect(commentsView.list.css('max-height')).toBe('none');

      commentsView.expanded(false);
      expect(commentsView.list.css('max-height')).not.toBe('none'); // resize the list to fit
    });
  });
  
  describe("mixpanel tracking", function() {
    beforeEach(function() {
      useFakeServer();
      Application.currentUser(creator1);
      mpq = [];
    });

    describe("when a comment is created", function() {
      it("pushes a 'create comment' event to the mixpanel queue", function() {
        commentsView.textarea.val("wicked data, bro.");
        commentsView.createButton.click();
        spyOn(Server.lastCreate.record, 'creator').andReturn(creator1);
        spyOn(Server.lastCreate.record, 'createdAt').andReturn(new Date());

        Server.lastCreate.simulateSuccess();

        expect(mpq.length).toBe(1);
        var event = mpq.pop();
        expect(event[0]).toBe('track');
        expect(event[1]).toContain('Create');
        expect(event[1]).toContain('Comment');
      });
    });
  });
});
