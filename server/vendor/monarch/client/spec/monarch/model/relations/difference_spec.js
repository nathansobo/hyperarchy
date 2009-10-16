//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Relations.Difference", function() {
    describe("#records", function() {
      use_local_fixtures();
      var left_operand, right_operand, difference;
      before(function() {
        left_operand = User.table;
        right_operand = User.where(User.age.eq(28));
        expect(left_operand.records()).to_not(be_empty);
        expect(right_operand.records()).to_not(be_empty);

        difference = new Monarch.Model.Relations.Difference(left_operand, right_operand);
      });

      it("returns the records in the left operand which do not correspond to records with the same id in the right operand", function() {
        var difference_records = difference.records();

        expect(difference_records).to_not(be_empty);
        expect(difference_records.length).to(equal, left_operand.size() - right_operand.size());

        Monarch.Util.each(difference_records, function(record) {
          expect(right_operand.find(record.id())).to(be_null);
        });
      });
    });

    describe("event handling", function() {
      var table_1, table_2, difference, record, insert_callback, update_callback, remove_callback;
      before(function() {
        Monarch.ModuleSystem.constructor("Table1", Monarch.Model.Record);
        Monarch.ModuleSystem.constructor("Table2", Monarch.Model.Record);
        Table1.column('name', 'string');
        Table2.column('name', 'string');

        left_operand = Table1.table;
        right_operand = Table2.table;
        difference = new Monarch.Model.Relations.Difference(left_operand, right_operand);
        record = new Table1({id: "foo"});

        insert_callback = mock_function("insert_callback");
        update_callback = mock_function("update_callback");
        remove_callback = mock_function("remove_callback");
        difference.on_insert(insert_callback);
        difference.on_update(update_callback);
        difference.on_remove(remove_callback);
      });

      after(function() {
        delete window.Table1;
        delete window.Table2;
      });

      function expect_no_callbacks_to_have_been_called() {
        expect(insert_callback).to_not(have_been_called);
        expect(update_callback).to_not(have_been_called);
        expect(remove_callback).to_not(have_been_called);
      }

      describe("when a record is inserted in the left operand", function() {
        context("if the record is not present in the right operand", function() {
          it("triggers insert callbacks with the record", function() {
            left_operand.insert(record);
            expect(insert_callback).to(have_been_called, with_args(record));
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger any callbacks", function() {
            right_operand.insert(record);
            left_operand.insert(record);
            expect_no_callbacks_to_have_been_called();
          });
        });
      });

      describe("when a record is inserted in the right operand", function() {
        context("if the record is not present in the left operand", function() {
          it("does not trigger any callbacks", function() {
            right_operand.insert(record);
            expect_no_callbacks_to_have_been_called();
          });
        });

        context("if the record is present in the left operand", function() {
          it("triggers remove callbacks with the record", function() {
            left_operand.insert(record);
            right_operand.insert(record);
            expect(remove_callback).to(have_been_called, with_args(record));
          });
        });
      });

      describe("when a record is updated in the left operand", function() {
        context("if the record is not present in the right operand", function() {
          it("triggers update callbacks with the record", function() {
            left_operand.insert(record);
            record.local_update({name: "FOO"});
            expect(update_callback).to(have_been_called, with_args(record, {name: {column: Table1.name, old_value: null, new_value: "FOO" }}));
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger any callbacks", function() {
            right_operand.insert(record);
            left_operand.insert(record);
            record.local_update({name: "FOO"});
            expect_no_callbacks_to_have_been_called();
          });
        });
      });

      describe("when a record is removed from the left operand", function() {
        context("if the record is not present in the right operand", function() {
          it("triggers remove callbacks with the record", function() {
            left_operand.insert(record);
            left_operand.remove(record);
            expect(remove_callback).to(have_been_called, with_args(record));
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger any callbacks", function() {
            right_operand.insert(record);
            left_operand.insert(record);
            left_operand.remove(record);
            expect_no_callbacks_to_have_been_called();
          });
        });
      });

      describe("when a record is removed from the right operand", function() {
        context("if the record is not present in the left operand", function() {
          it("does not trigger any callbacks", function() {
            right_operand.insert(record);
            right_operand.remove(record);
            expect_no_callbacks_to_have_been_called();
          });
        });

        context("if the record is present in the left operand", function() {
          it("triggers insert callbacks with the record", function() {
            right_operand.insert(record);
            left_operand.insert(record);
            right_operand.remove(record);
            expect(insert_callback).to(have_been_called, with_args(record));
          });
        });
      });
    });
  });
}});
