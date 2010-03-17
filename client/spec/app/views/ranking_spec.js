//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views.Ranking", function() {
    useFakeApplicationController();
    useLocalFixtures();

    var view, user, election;
    before(function() {
      user = authenticate('nathan');
      election = Election.find('menu');
      view = Views.Ranking.toView();
      view.election(election);
    });

    describe("#handleUpdate(item), which is invoked by jQuery-ui's sortable", function() {
      it("invokes Ranking.createOrUpdate with the election id of the item, plus the election id of the predecessor and successor if they exist", function() {
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
        view.rankingOl.append(itemA);
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
