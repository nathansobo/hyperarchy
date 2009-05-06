
require("/specs/june_spec_helper");

Screw.Unit(function(c) { with(c) {
  describe("All relations", function() {
    describe("#where", function() {
      it("builds a Selection", function() {
        var predicate = User.id.eq("bob");
        var selection = User.where(predicate)
        expect(selection.constructor).to(equal, June.Relations.Selection);
        expect(selection.operand).to(equal, User);
        expect(selection.predicate).to(equal, predicate);
      });
    });

    describe("#join(:left).on(:right)", function() {
      it("builds an InnerJoin", function() {
        var predicate = Pet.owner_id.eq(User.id);
        var inner_join = User.join(Pet).on(predicate);
        expect(inner_join.left_operand).to(equal, User);
        expect(inner_join.right_operand).to(equal, Pet);
        expect(inner_join.predicate).to(equal, predicate);
      });
    });

    describe("#project", function() {
      it("builds a SetProjection", function() {
        var predicate = Pet.owner_id.eq(User.id);
        var inner_join = User.join(Pet).on(predicate);
        var projection = inner_join.project(Pet);

        expect(projection.operand).to(equal, inner_join);
        expect(projection.projected_set).to(equal, Pet);
      });
    });

    describe("#find", function() {
      context("when passed an id", function() {
        it("returns the first element of a selection where relation.id is equal to the given id", function() {
          expect(User.find("bob")).to(equal, User.where(User.id.eq("bob")).first());
        });
      });

      context("when passed a predicate", function() {
        it("returns the first element of a selection constructed with the given predicate", function() {
          var predicate = User.age.eq(21);
          expect(User.find(predicate)).to(equal, User.where(predicate).first());
        });
      });
    });

    describe("#first", function() {
      it("returns the first element of #tuples", function() {
        expect(User.first()).to(equal, User.tuples()[0]);
      });
    });

    describe("#map", function() {
      it("returns a new Array built by invoking the given function on each tuple in the relation", function() {
        var expected_result = [];
        tuples = User.tuples();
        for(var i = 0; i < tuples.length; i++) {
          expected_result.push(tuples[i].first_name());
        }

        expect(User.map(function() { return this.first_name() })).to(equal, expected_result);
      });
    });
    
    describe("#each", function() {
      it("invokes the given function on each tuple in the relation", function() {
        var each_tuple = [];
        var results = User.each(function() { each_tuple.push(this) });
        expect(each_tuple).to(equal, User.tuples());
      });
    });

  });
}});