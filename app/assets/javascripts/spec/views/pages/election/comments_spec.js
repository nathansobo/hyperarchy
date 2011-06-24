//= require spec/spec_helper

describe("Views.Pages.Election.Comments", function() {
  var election, comment1, comment2, creator1, creator2, commentsRelation, commentsView, longCommentBody;

  beforeEach(function() {
    attachLayout();
    Application.currentUser(User.createFromRemote({id: 1}));

    election = Election.createFromRemote({id: 22, creatorId: 1, createdAt: 234});
    creator1 = User.createFromRemote({id: 1, firstName: "Commento", lastName: "Santiago"});
    creator2 = User.createFromRemote({id: 2, firstName: "Kommentor", lastName: "Brunsfeld"});
    comment1 = election.comments().createFromRemote({id: 11, body: "I likeah the fruiloops so much", creatorId: creator1.id(), createdAt: 3245});
    comment2 = election.comments().createFromRemote({id: 12, body: "Yez but sie koko krispies sind sehr yummy", creatorId: creator2.id(), createdAt: 3295});

    spyOn(ElectionComment.prototype, 'editableByCurrentUser').andReturn(true);

    commentsView = Application.electionPage.comments;
    commentsRelation = election.comments();
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

    describe("when the create comment button is clicked", function() {
      it("clears the textarea and submits a comment to the server", function() {
        commentsView.textarea.val("I like to eat stamps!");
        commentsView.createLink.click();
        expect(commentsView.textarea.val()).toBe('');

        expect(Server.creates.length).toBe(1);

        var createdRecord = Server.lastCreate.record;

        expect(createdRecord.body()).toBe("I like to eat stamps!");
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
  
  describe("rendering", function() {
    beforeEach(function() {
      $('#jasmine_content').html(commentsView);
      commentsView.height(300);
    });
    
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

      describe("when the window is resized (which could cause the height of the comments view to change)", function() {
        it("enables full-height mode to avoid overflow and disables it if no longer needed", function() {
          expect(commentsView).not.toHaveClass('full-height');

          commentsView.height(150);
          $(window).resize();

          expect(commentsView).toHaveClass('full-height');
          expectListScrolledToBottom();

          commentsView.height(300);
          $(window).resize();

          expect(commentsView).not.toHaveClass('full-height');
          expectListScrolledToBottom();
        });
      });

      function expectListScrolledToBottom() {
        var list = commentsView.list;
        expect(list.attr('scrollTop') + list.height()).toBe(list.attr('scrollHeight'));
      }
    });
  });
});
