//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views.Candidates", function() {
    useRemoteFixtures();

    var view, election;
    before(function() {
      view = Views.Candidates.toView();
      election = Election.fixture('menu');
    });

    describe("#election(election)", function() {
      var user;
      before(function() {
        user = authenticate("nathan");
        Server.auto = false;
      });

      context("if the given election is not currently being displayed", function() {
        it("fetches and displays the election's candidates", function() {
          view.election(election);
          expect(Server.fetches.length).to(eq, 1);
          expect(Server.lastFetch.relations).to(equal, [election.candidates(), election.rankingsForUser(user)]);
          Server.lastFetch.simulateSuccess();

          expect(election.candidates().empty()).to(beFalse);
          election.unrankedCandidatesForUser(user).each(function(candidate) {
            expect(view.candidatesOl.find("li[candidateId='" + candidate.id() + "']")).toNot(beEmpty);
          });
        });

        it("cancels subscriptions to the previous relation", function() {
          Server.auto = true;
          view.election(election);
          var newElection = Election.fixture('features');
          view.election(newElection);

          election.candidates().createFromRemote({id: "newCandidate", body: "This should not appear in the list"});
          expect(view.candidatesOl.find("li[candidateId='newCandidate']")).to(beEmpty);
        });
      });

      context("if the given election is currently being displayed", function() {
        it("does not refetch or redisplay the election's candidates", function() {
          view.election(election);
          Server.lastFetch.simulateSuccess();

          view.election(election);
          expect(Server.fetches).to(beEmpty);
        });
      });
    });

  });
}});
