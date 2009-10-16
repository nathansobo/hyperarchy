//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Relations.Ordering", function() {
    var ordering, operand, order_by_column_1, order_by_column_2;

    use_example_domain_model();

    before(function() {
      operand = User.table;
      ordering = new Monarch.Model.Relations.Ordering(operand, [order_by_column_1, order_by_column_2]);
    });

    describe("#records", function() {
      before(function() {
        User.local_create({id: "4", age: 3, full_name: "D"});
        User.local_create({id: "1", age: 1, full_name: "A"});
        User.local_create({id: "3", age: 2, full_name: "C"});
        User.local_create({id: "2", age: 2, full_name: "B"});
      });

      context("when both of the ordering columns are ascending", function() {
        init(function() {
          order_by_column_1 = User.age.asc();
          order_by_column_2 = User.full_name.asc();
        });

        it("returns the records of its #operand in the correct order", function() {
          var expected_ids = ["1", "2", "3", "4"];
          var actual_ids = Monarch.Util.map(ordering.records(), function() { return this.id() });
          expect(actual_ids).to(equal, expected_ids);
        });
      });

      context("when one of the ordering columns is descending", function() {
        init(function() {
          order_by_column_1 = User.age.desc();
          order_by_column_2 = User.full_name.asc();
        });

        it("returns the records of its #operand in the correct order", function() {
          var expected_ids = ["4", "2", "3", "1"];
          var actual_ids = Monarch.Util.map(ordering.records(), function() { return this.id() });
          expect(actual_ids).to(equal, expected_ids);
        });
      });
    });
  });
}});
