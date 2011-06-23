//= require spec/spec_helper

describe("Views.Pages.Election.CommentLi", function() {
  var election, comment, creator, commentLi;

  beforeEach(function() {
    attachLayout();
    Application.currentUser(User.createFromRemote({id: 1}));

    election = Election.createFromRemote({id: 22, creatorId: 1, createdAt: 234});
    creator = User.createFromRemote({id: 1, firstName: "Commento", lastName: "Santiago"});
    comment = election.comments().createFromRemote({id: 11, body: "I likeah the fruiloops so much", creatorId: creator.id(), createdAt: 3245});
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
});
