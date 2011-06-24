//= require spec/spec_helper

describe("Views.Pages.Election.Comments", function() {
  var election, comment1, comment2, creator1, creator2, commentsRelation, commentsView;

  beforeEach(function() {
    attachLayout();
    Application.currentUser(User.createFromRemote({id: 1}));

    election = Election.createFromRemote({id: 22, creatorId: 1, createdAt: 234});
    creator1 = User.createFromRemote({id: 1, firstName: "Commento", lastName: "Santiago"});
    creator2 = User.createFromRemote({id: 2, firstName: "Kommentor", lastName: "Brunsfeld"});
    comment1 = election.comments().createFromRemote({id: 11, body: "I likeah the fruiloops so much", creatorId: creator1.id(), createdAt: 3245});
    comment2 = election.comments().createFromRemote({id: 12, body: "Yez but sie koko krispies sind sehr yummy", creatorId: creator2.id(), createdAt: 3295});

    spyOn(comment1, 'editableByCurrentUser').andReturn(true);
    spyOn(comment2, 'editableByCurrentUser').andReturn(true);

    commentsView = Application.electionPage.comments;
    commentsRelation = election.comments();
    commentsView.comments(commentsRelation);
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
});
