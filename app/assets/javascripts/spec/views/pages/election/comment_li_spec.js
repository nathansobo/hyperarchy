//= require spec/spec_helper

describe("Views.Pages.Election.CommentLi", function() {
  var currentUser, election, comment, creator, commentLi, commentEditableByCurrentUser;


  beforeEach(function() {
    attachLayout();
    currentUser = User.createFromRemote({id: 1});
    Application.currentUser(currentUser);

    election = Election.createFromRemote({id: 22, creatorId: 1, createdAt: 234});
    creator = User.createFromRemote({id: 2, firstName: "Commento", lastName: "Santiago"});
    comment = election.comments().createFromRemote({id: 11, body: "I likeah the fruiloops so much", creatorId: creator.id(), createdAt: 3245});
    spyOn(comment, 'editableByCurrentUser').andCallFake(function() {
      return commentEditableByCurrentUser;
    });

    commentLi = Views.Pages.Election.CommentLi.toView({comment: comment});
  });

  describe("#initialize", function() {
    it("populates the avatar, name, body, and createdAt date", function() {
      expect(commentLi.avatar.user()).toBe(creator);
      expect(commentLi.creatorName.text()).toBe(creator.fullName());
      expect(commentLi.body.text()).toBe(comment.body());
      expect(commentLi.createdAt.text()).toBe(comment.formattedCreatedAt());
    });

  });
  
  describe("comment deletion", function() {
    describe("when the li is initialized", function() {
      it("adds the deletable class if the current user can delete the comment", function() {
        commentEditableByCurrentUser = false;
        commentLi = Views.Pages.Election.CommentLi.toView({comment: comment});
        expect(commentLi).not.toHaveClass('destroyable');

        commentEditableByCurrentUser = true;
        commentLi = Views.Pages.Election.CommentLi.toView({comment: comment});
        expect(commentLi).toHaveClass('destroyable');
      });

      describe("when the destroy button is clicked", function() {
        it("destroys the comment", function() {
          useFakeServer();
          commentLi.destroyLink.click();
          expect(Server.destroys.length).toBe(1);
          expect(Server.lastDestroy.record).toBe(comment);
        });
      });
    });

    describe("when the current user changes", function() {
      it("adds the deletable class if the current user can delete the comment", function() {
        commentEditableByCurrentUser = true;
        Application.currentUser(creator);
        expect(commentLi).toHaveClass('destroyable');

        commentEditableByCurrentUser = false;
        Application.currentUser(currentUser);
        expect(commentLi).not.toHaveClass('destroyable');
      });
    });
  });
});
