//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views.SortedList", function() {
    var view, relation, relation2;

    before(function() {
      view = Views.SortedList.toView({
        buildElement: function(candidate) {
          return $("<li>" + candidate.body() + "</li>");
        }
      });

      var election = Election.createFromRemote({id: "color", body: "What's your favorite color?"});
      relation = election.candidates();
      relation.createFromRemote({id: "red", body: "Red", position: 1});
      relation.createFromRemote({id: "green", body: "Green", position: 3});
      relation.createFromRemote({id: "blue", body: "Blue", position: 5});

      var election2 = Election.createFromRemote({id: "car", body: "What's your favorite type of car?"});
      relation2 = election2.candidates();
      relation2.createFromRemote({id: "audi", body: "Audi", position: 1});
      relation2.createFromRemote({id: "volvo", body: "Volvo", position: 3});
      relation2.createFromRemote({id: "mercedes", body: "Mercedes", position: 5});

      view.relation(relation);
    });

    describe("when a relation is assigned", function() {
      it("unsubscribes from any previous relation and populates the list with elements based on the new relation", function() {
        expect(view.find('li').length).to(eq, 3);
        expect(view.find("li:eq(0)").html()).to(eq, "Red");
        expect(view.find("li:eq(1)").html()).to(eq, "Green");
        expect(view.find("li:eq(2)").html()).to(eq, "Blue");

        expect(relation2.hasSubscribers()).to(beFalse);
        view.relation(relation2);
        expect(relation.hasSubscribers()).to(beFalse);
        expect(relation2.hasSubscribers()).to(beTrue);

        expect(view.find('li').length).to(eq, 3);
        expect(view.find("li:eq(0)").html()).to(eq, "Audi");
        expect(view.find("li:eq(1)").html()).to(eq, "Volvo");
        expect(view.find("li:eq(2)").html()).to(eq, "Mercedes");
      });
    });

    describe("when a record is inserted into the relation", function() {
      it("inserts an li for the record at the appropriate index", function() {
        relation.createFromRemote({id: "yellow", body: "Yellow", position: 4});
        expect(view.find("li:eq(2)").html()).to(eq, "Yellow");
        expect(view.find("li:eq(3)").html()).to(eq, "Blue");
      });
    });

    describe("when a record is removed from the relation", function() {
      it("removes the li corresponding to the record", function() {
        relation.first().remotelyDestroyed();
        expect(view.find('li').length).to(eq, 2);
        expect(view.find("li:contains('Red')")).to(beEmpty);
      });
    });

    describe("when the position of a record is updated in the relation", function() {
      it("moves the li corresponding to the record to the appropriate location", function() {
        var record = relation.first();
        record.remotelyUpdated({position: 4});
        expect(view.find("li").length).to(eq, 3);
        expect(view.find("li:eq(1)").html()).to(eq, "Red");
        record.remotelyUpdated({position: 6});
        expect(view.find("li:eq(2)").html()).to(eq, "Red");
      });
    });

    describe("#remove", function() {
      before(function() {
        $("#testContent").append(view);
      });

      after(function() {
        $("#testContent").empty();
      });

      it("unsubscribes from the relation after removing itself from the dom", function() {
        expect(relation.hasSubscribers()).to(beTrue);
        view.remove();
        expect($("#testContent").find('ol')).to(beEmpty);
        expect(relation.hasSubscribers()).to(beFalse);
      });
    });
  });
}});