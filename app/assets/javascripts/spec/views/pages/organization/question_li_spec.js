//= require spec/spec_helper

describe("Views.Pages.Organization.ElectionLi", function() {
  var electionLi, creator, election, candidate1, candidate2, candidate1Li, candidate2Li;
  beforeEach(function() {
    attachLayout();
    creator = User.createFromRemote({id: 1, emailHash: "email-hash"});
    election = Election.createFromRemote({id: 1, body: "What's your favorite color?", creatorId: creator.id()});
    candidate1 = election.candidates().createFromRemote({id: 1, body: "Red", position: 1});
    candidate2 = election.candidates().createFromRemote({id: 2, body: "Blue", position: 2});
    electionLi = Views.Pages.Organization.ElectionLi.toView({election: election});
    candidate1Li = electionLi.find('li:contains("Red")').view();
    candidate2Li = electionLi.find('li:contains("Blue")').view();
  });

  describe("#initialize", function() {
    it("assigns the body, candidates, candidate positions, and creator avatar", function() {
      expect(electionLi.avatar.user()).toBe(creator);
      expect(electionLi.body.text()).toBe(election.body());
      expect(electionLi.candidates.relation().tuples()).toEqual(election.candidates().tuples());
      expect(candidate1Li.position.text()).toBe('1');
      expect(candidate2Li.position.text()).toBe('2');
    });
  });

  describe("when the position of candidates change", function() {
    it("updates the position number on the candidate li", function() {
      expect(candidate1Li.position.text()).toBe('1');
      expect(candidate2Li.position.text()).toBe('2');

      candidate1.remotelyUpdated({position: 2});
      candidate2.remotelyUpdated({position: 1});

      expect(candidate2Li.position.text()).toBe('1');
      expect(candidate1Li.position.text()).toBe('2');
    });
  });
});
