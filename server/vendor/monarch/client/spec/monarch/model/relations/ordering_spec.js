//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Relations.Ordering", function() {
    var ordering, operand, orderByColumn1, orderByColumn2;

    useExampleDomainModel();

    before(function() {
      operand = User.table;
      ordering = new Monarch.Model.Relations.Ordering(operand, [orderByColumn1, orderByColumn2]);
    });

    describe("#tuples", function() {
      before(function() {
        User.localCreate({id: "4", age: 3, fullName: "D"});
        User.localCreate({id: "1", age: 1, fullName: "A"});
        User.localCreate({id: "3", age: 2, fullName: "C"});
        User.localCreate({id: "2", age: 2, fullName: "B"});
      });

      context("when both of the ordering columns are ascending", function() {
        init(function() {
          orderByColumn1 = User.age.asc();
          orderByColumn2 = User.fullName.asc();
        });

        it("returns the tuples of its #operand in the correct order", function() {
          var expectedIds = ["1", "2", "3", "4"];
          var actualIds = Monarch.Util.map(ordering.tuples(), function() { return this.id() });
          expect(actualIds).to(equal, expectedIds);
        });
      });

      context("when one of the ordering columns is descending", function() {
        init(function() {
          orderByColumn1 = User.age.desc();
          orderByColumn2 = User.fullName.asc();
        });

        it("returns the tuples of its #operand in the correct order", function() {
          var expectedIds = ["4", "2", "3", "1"];
          var actualIds = Monarch.Util.map(ordering.tuples(), function() { return this.id() });
          expect(actualIds).to(equal, expectedIds);
        });
      });
    });
  });
}});
