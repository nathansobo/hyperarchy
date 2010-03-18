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
      before(function() {
        Server.auto = false;
      });

      context("if the given election is not currently being displayed", function() {
        it("fetches and displays the election's candidates", function() {
          view.election(election);
          expect(Server.fetches.length).to(eq, 1);
          expect(Server.lastFetch.relations).to(equal, [election.candidates()]);
          Server.lastFetch.simulateSuccess();

          expect(election.candidates().empty()).to(beFalse);
          election.candidates().each(function(candidate) {
            expect(view.candidatesOl.find("li[candidateId='" + candidate.id() + "']")).toNot(beEmpty);
          });
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
