//= require spec/spec_helper

describe("Views.Components.SortedList", function() {
  var view, relation, relation2;

  beforeEach(function() {
    view = Views.Components.SortedList.toView({
      buildElement: function(candidate) {
        return $("<li>" + candidate.body() + "</li>");
      }
    });

    var election = Election.createFromRemote({id: 1, body: "What's your favorite color?"});
    relation = election.candidates();
    relation.createFromRemote({id: 1, body: "Red", position: 1});
    relation.createFromRemote({id: 2, body: "Green", position: 3});
    relation.createFromRemote({id: 3, body: "Blue", position: 5});

    var election2 = Election.createFromRemote({id: 2, body: "What's your favorite type of car?"});
    relation2 = election2.candidates();
    relation2.createFromRemote({id: 4, body: "Audi", position: 1});
    relation2.createFromRemote({id: 5, body: "Volvo", position: 3});
    relation2.createFromRemote({id: 6, body: "Mercedes", position: 5});

    view.relation(relation);
  });

  describe("when a relation is assigned", function() {
    it("unsubscribes from any previous relation and populates the list with elements based on the new relation", function() {
      expect(view.find('li').length).toBe(3);
      expect(view.find("li:eq(0)").html()).toBe("Red");
      expect(view.find("li:eq(1)").html()).toBe("Green");
      expect(view.find("li:eq(2)").html()).toBe("Blue");

      expect(relation2.hasSubscribers()).toBeFalsy();
      view.relation(relation2);

      expect(relation.hasSubscribers()).toBeFalsy();
      expect(relation2.hasSubscribers()).toBeTruthy();

      expect(view.find('li').length).toBe(3);
      expect(view.find("li:eq(0)").html()).toBe("Audi");
      expect(view.find("li:eq(1)").html()).toBe("Volvo");
      expect(view.find("li:eq(2)").html()).toBe("Mercedes");
    });
  });

  describe("when a null relation is assigned", function() {
    it("unsubscribes from a previous relation and empties the list", function() {
      expect(view.find('li').length).toBe(3);
      expect(relation.hasSubscribers()).toBeTruthy();

      view.relation(null);

      expect(view.find('li')).not.toExist();
      expect(relation.hasSubscribers()).toBeFalsy();
    });
  });

  describe("when a record is inserted into the relation", function() {
    it("inserts an li for the record at the appropriate index", function() {
      relation.createFromRemote({id: "yellow", body: "Yellow", position: 4});
      expect(view.find("li:eq(2)").html()).toBe("Yellow");
      expect(view.find("li:eq(3)").html()).toBe("Blue");
    });
  });

  describe("when a record is removed from the relation", function() {
    it("removes the li corresponding to the record and removes it from the elementsById hash", function() {
      var record = relation.first();
      record.remotelyDestroyed();
      expect(view.find('li').length).toBe(2);
      expect(view).not.toContain("li:contains('Red')");
      expect(view.elementsById[record.id()]).toBeUndefined();
    });
  });

  describe("when the position of a record is updated in the relation", function() {
    it("moves the li corresponding to the record to the appropriate location", function() {
      var record = relation.first();
      record.remotelyUpdated({position: 4});
      expect(view.find("li").length).toBe(3);
      expect(view.find("li:eq(1)").html()).toBe("Red");
      record.remotelyUpdated({position: 6});
      expect(view.find("li:eq(2)").html()).toBe("Red");
    });
  });

  describe("#remove", function() {
    beforeEach(function() {
      $("#testContent").append(view);
    });

    afterEach(function() {
      $("#testContent").empty();
    });

    it("unsubscribes from the relation after removing itself from the dom", function() {
      expect(relation.hasSubscribers()).toBeTruthy();
      view.remove();
      expect($("#testContent")).not.toContain('ol');
      expect(relation.hasSubscribers()).toBeFalsy();
    });
  });
});
