//= require spec/spec_helper

describe("Views.Pages.Election.Votes", function() {
  var votesView, election, currentUser, otherUser, currentUserVote, otherUserVote, votesRelation;

  beforeEach(function() {
    attachLayout();
    votesView = Application.electionPage.votes;
    $('jasmine-content').html(votesView);

    election = Election.createFromRemote({id: 1});
    currentUser = User.createFromRemote({id: 1});
    otherUser = User.createFromRemote({id: 2});

    currentUserVote = currentUser.votes().createFromRemote({id: 1, electionId: election.id(), updatedAt: 1308353647242});
    otherUserVote = otherUser.votes().createFromRemote({id: 2, electionId: election.id(), updatedAt: 1308353647242});

    votesRelation = election.votes();
  });

  describe("#votes", function() {
    it("assigns the relation on the list, which populates it with vote lis", function() {
      votesView.votes(votesRelation);
      expect(votesView.list.relation()).toBe(votesRelation);
      expect(votesView.list.find('li.vote').size()).toBe(2);
    });

    it("adjusts the vote count in the header", function() {
      votesView.votes(votesRelation);
      expect(votesView.header.html()).toEqual('2 Votes');
    });
  });

  describe("when votes are added and removed", function() {
    it("adjusts the vote count in the header accordingly", function() {
      votesView.votes(votesRelation);
      expect(votesView.header.html()).toEqual('2 Votes');

      currentUserVote.remotelyDestroyed();
      expect(votesView.header.html()).toEqual('1 Vote');

      otherUserVote.remotelyDestroyed();
      expect(votesView.header.html()).toEqual('No Votes Yet');

      currentUser.votes().createFromRemote({id: 1, electionId: election.id(), updatedAt: 1308353647000});
      expect(votesView.header.html()).toEqual('1 Vote');

     otherUser.votes().createFromRemote({id: 2, electionId: election.id(), updatedAt: 1308353647001});
     expect(votesView.header.html()).toEqual('2 Votes');
    });
  });

  describe("#selectedVoterId", function() {
    describe("when the votes relation has been assigned", function() {
      it("adds the .selected class to the li for the given voter", function() {
        var thirdUser = User.createFromRemote({id: 3});
        votesRelation.createFromRemote({userId: thirdUser.id(), updatedAt: 1308353647262});
        votesView.votes(votesRelation);

        votesView.selectedVoterId(otherUser.id());
        var otherUserVoteLi = votesView.list.find('li:contains(' + otherUser.fullName() + ')');
        expect(otherUserVoteLi).toExist();
        expect(otherUserVoteLi).toHaveClass('selected');
        expect(votesView.list.find('.selected').size()).toBe(1);

        votesView.selectedVoterId(thirdUser.id());
        var thirdUserVoteLi = votesView.list.find('li:contains(' + thirdUser.fullName() + ')');
        expect(thirdUserVoteLi).toExist();
        expect(thirdUserVoteLi).toHaveClass('selected');
        expect(votesView.list.find('.selected').size()).toBe(1);
      });
    });

    describe("when the votes relation has not yet been assigned", function() {
      it("adds the .selected class to the li once the votes relation has been assigned", function() {
        votesView.selectedVoterId(otherUser.id());
        votesView.votes(votesRelation);
        var otherUserVoteLi = votesView.list.find('li:contains(' + otherUser.fullName() + ')');
        expect(otherUserVoteLi).toHaveClass('selected');
        expect(votesView.list.find('.selected').size()).toBe(1);
      });
    });
  });
});
