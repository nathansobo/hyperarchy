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

      currentUser.votes().createFromRemote({id: 1, electionId: election.id()});
      expect(votesView.header.html()).toEqual('1 Vote');
//
//      otherUser.votes().createFromRemote({id: 2, electionId: election.id()});
//      expect(votesView.header.html()).toEqual('2 Votes');
    });
  });
});