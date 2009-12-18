//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Relations.Difference", function() {
    use_example_domain_model();

    var left_operand, right_operand, union;
    before(function() {
      left_operand = User.where({full_name: "John"});
      right_operand = User.where({age: 32});
      union = new Monarch.Model.Relations.Union(left_operand, right_operand);
    });


    describe("#all_tuples", function() {
      it("returns the union tuples in the left operand and right operand", function() {
        var user_1 = User.local_create({age: 22, full_name: "Mackrel"});
        var user_2 = User.local_create({age: 32, full_name: "Jonie"});
        var user_3 = User.local_create({age: 32, full_name: "John"});
        var user_4 = User.local_create({full_name: "John"});
        var user_5 = User.local_create({full_name: "Mark"});

        console.debug(left_operand.size());
        console.debug(right_operand.size());

        Server.save(User.table);

        var tuples = union.all_tuples();
        expect(tuples.length).to(equal, 3);
        expect(_.include(tuples, user_2)).to(be_true);
        expect(_.include(tuples, user_3)).to(be_true);
        expect(_.include(tuples, user_4)).to(be_true);
      });
    });

    describe("event handling", function() {
      var table_1, table_2, difference, record, insert_callback, update_callback, remove_callback;
      init(function() {
        left_operand = Blog.table;
        right_operand = Blog.table;
      });

      before(function() {
        difference = new Monarch.Model.Relations.Difference(left_operand, right_operand);

        insert_callback = mock_function("insert_callback");
        update_callback = mock_function("update_callback");
        remove_callback = mock_function("remove_callback");
        difference.on_insert(insert_callback);
        difference.on_update(update_callback);
        difference.on_remove(remove_callback);
      });

      function expect_no_callbacks_to_have_been_called() {
        expect(insert_callback).to_not(have_been_called);
        expect(update_callback).to_not(have_been_called);
        expect(remove_callback).to_not(have_been_called);
      }

      describe("when a record is inserted in the left operand", function() {
        context("if the record is not present in the right operand", function() {
          it("triggers insert callbacks with the record", function() {
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger any callbacks", function() {
          });
        });
      });

      describe("when a record is inserted in the right operand", function() {
        context("if the record is not present in the left operand", function() {
          it("does not trigger any callbacks", function() {
          });
        });

        context("if the record is present in the left operand", function() {
          it("triggers remove callbacks with the record", function() {
          });
        });
      });

      describe("when a record is updated in the left operand", function() {
        context("if the record is not present in the right operand", function() {
          it("triggers update callbacks with the record", function() {
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger any callbacks", function() {
          });
        });
      });

      describe("when a record is removed from the left operand", function() {
        context("if the record is not present in the right operand", function() {
          it("triggers remove callbacks with the record", function() {
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger any callbacks", function() {
          });
        });
      });

      describe("when a record is removed from the right operand", function() {
        context("if the record is not present in the left operand", function() {
          it("does not trigger any callbacks", function() {
          });
        });

        context("if the record is present in the left operand", function() {
          it("triggers insert callbacks with the record", function() {
          });
        });
      });
    });
  });
}});
