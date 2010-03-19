//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views.Rankings", function() {
    useFakeApplicationController();
    useLocalFixtures();

    var view, user, election;
    before(function() {
      user = authenticate('nathan');
      election = Election.fixture('menu');
      view = Views.Rankings.toView();
      view.election(election);
    });

    describe("#election(election)", function() {
      init(function() {
        Server.auto = false;
      });

      context("when the given election differs from the current election", function() {
        it("fetches the rankings associated with the current user and displays them in order", function() {
          var rankings = election.rankings().forUser(user);
          expect(Server.fetches.length).to(eq, 1);
          expect(Server.lastFetch.relations).to(equal, [election.candidates(), rankings]);

          Server.lastFetch.simulateSuccess();

          expect(rankings.empty()).to(beFalse);
          rankings.each(function(ranking, index) {
            expect(view.rankingsOl.find("li:eq(" + index + ")").attr('candidateId')).to(equal, ranking.candidateId());
          });
        });
      });

      context("when the given election does not differ from the current election", function() {
        it("does not fetch rankings again", function() {
          Server.lastFetch.simulateSuccess();
          view.election(election);
          expect(Server.fetches).to(beEmpty);
        });
      });
    });

    describe("#handleUpdate(item), which is invoked by jQuery-ui's sortable", function() {
      it("invokes Ranking.createOrUpdate with the election id of the item, plus the election id of the predecessor and successor if they exist", function() {
        Ranking.clear();
        view.rankingsOl.empty();

        var candidateA = election.candidates().at(0);
        var candidateB = election.candidates().at(1);
        var candidateC = election.candidates().at(2);

        mockProxy(Ranking, 'createOrUpdate');

        var itemA = View.build(function(b) {
          b.li({candidateId: candidateA.id()});
        });
        var itemB = View.build(function(b) {
          b.li({candidateId: candidateB.id()});
        });
        var itemC = View.build(function(b) {
          b.li({candidateId: candidateC.id()});
        });

        // simulate insertion with jQuery-UI sortable
        view.rankingsOl.append(itemA);
        view.handleUpdate(itemA);
        expect(Ranking.createOrUpdate).to(haveBeenCalled, withArgs(user, election, candidateA, null, null));

        itemB.insertBefore(itemA);
        view.handleUpdate(itemB);
        expect(Ranking.createOrUpdate).to(haveBeenCalled, withArgs(user, election, candidateB, null, candidateA));
        
        itemC.insertAfter(itemB);
        view.handleUpdate(itemC);
        expect(Ranking.createOrUpdate).to(haveBeenCalled, withArgs(user, election, candidateC, candidateB, candidateA));

        itemB.remove();
        itemB.insertAfter(itemA);
        view.handleUpdate(itemB);
        expect(Ranking.createOrUpdate).to(haveBeenCalled, withArgs(user, election, candidateB, candidateA, null));
      });
    });
  });
}});
