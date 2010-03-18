//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views.Elections", function() {
    useRemoteFixtures();

    var view, elections;
    before(function() {
      view = Views.Elections.toView();
      Server.autoFetch([Organization.table]);
      elections = Organization.fixture('restaurant').elections();
    });

    describe("#elections(electionsRelation)", function() {
      before(function() {
        Server.auto = false;
      });


      context("if the view is not currently displaying the given relation", function() {
        it("causes the assigned elections relation to be fetched, then the elections to be rendered", function() {
          view.elections(elections);
          expect(Server.fetches.length).to(eq, 1);
          expect(Server.lastFetch.relations).to(equal, [elections]);

          Server.lastFetch.simulateSuccess();
          elections.each(function(election) {
            expect(view.electionsOl.find("li[electionId='" + election.id() +"']")).toNot(beEmpty);
          });
        });
      });

      context("if the view is already displaying the given relation", function() {
        it("does not refetch or redraw the elections list", function() {
          view.elections(elections);
          Server.lastFetch.simulateSuccess();

          view.elections(elections);
          expect(Server.fetches).to(beEmpty);
        });
      });
    });

    describe("#navigate(electionId)", function() {
      before(function() {
        Server.auto = false;
        view.elections(elections);
      });

      context("when the elections are still being fetched", function() {
        it("causes the same call to navigate to recurse once the elections have been fetched", function() {
          view.navigate('menu');
          mock(view, 'navigate');
          Server.lastFetch.simulateSuccess();
          expect(view.navigate).to(haveBeenCalled, withArgs('menu'));
        });
      });

      context("when the elections are done being fetched", function() {
        it("selects the election corresponding to the id", function() {
          Server.lastFetch.simulateSuccess();
          mock(view, 'electionSelected');
          view.navigate('menu');
          expect(view.electionSelected).to(haveBeenCalled, withArgs(Election.fixture('menu')));
        });
      });
    });

    describe("when an election li is clicked", function() {
      it("calls History.load with the path to the election", function() {
        view.elections(elections);
        view.electionsOl.find("li[electionId='menu']").click();
        expect(History.path).to(equal, 'organizations/restaurant/elections/menu');
      });
    });
  });
}});
