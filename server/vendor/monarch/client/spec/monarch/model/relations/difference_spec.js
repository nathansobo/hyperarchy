//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Relations.Difference", function() {
    use_local_fixtures();

    describe("#tuples", function() {
      var left_operand, right_operand, difference;
      before(function() {
        left_operand = User.table;
        right_operand = User.where(User.age.eq(28));
        expect(left_operand.tuples()).to_not(be_empty);
        expect(right_operand.tuples()).to_not(be_empty);

        difference = new Monarch.Model.Relations.Difference(left_operand, right_operand);
      });

      it("returns the tuples in the left operand which do not correspond to tuples with the same id in the right operand", function() {
        var difference_tuples = difference.tuples();

        expect(difference_tuples).to_not(be_empty);
        expect(difference_tuples.length).to(equal, left_operand.size() - right_operand.size());

        Monarch.Util.each(difference_tuples, function(record) {
          expect(right_operand.find(record.id())).to(be_null);
        });
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
          init(function() {
            right_operand = Blog.where({user_id: "jim"});
          });

          it("triggers insert callbacks with the record", function() {
            left_operand.create({user_id: "johan"})
              .after_events(function(record) {
                expect(insert_callback).to(have_been_called, with_args(record));
              });
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger any callbacks", function() {
            left_operand.create({});
            expect_no_callbacks_to_have_been_called();
          });
        });
      });

      describe("when a record is inserted in the right operand", function() {
        context("if the record is not present in the left operand", function() {
          init(function() {
            left_operand = Blog.where({user_id: "jim"});
          });

          it("does not trigger any callbacks", function() {
            right_operand.create({user_id: "johan"});
            expect_no_callbacks_to_have_been_called();
          });
        });

        context("if the record is present in the left operand", function() {
          init(function() {
            right_operand = Blog.where({user_id: "jim"});
          });

          it("triggers remove callbacks with the record", function() {
            left_operand.create({user_id: "willy"})
              .after_events(function(record) {
                record.update({user_id: "jim"})
                  .after_events(function() {
                    expect(remove_callback).to(have_been_called, with_args(record));
                  });
              });
          });
        });
      });

      describe("when a record is updated in the left operand", function() {
        context("if the record is not present in the right operand", function() {
          init(function() {
            right_operand = Blog.where({user_id: 'jim'});
          });

          it("triggers update callbacks with the record", function() {
            var record = left_operand.find('recipes');
            var user_id_before_update = record.user_id();
            record.update({user_id: "bingcrosby"});
            expect(update_callback).to(have_been_called, once);
            expect(update_callback).to(have_been_called, with_args(record, {user_id: {column: Blog.user_id, old_value: user_id_before_update, new_value: "bingcrosby" }}));
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger any callbacks", function() {
            var record = Blog.find('recipes');
            record.update({user_id: "mojo"});
            expect_no_callbacks_to_have_been_called();
          });
        });
      });

      describe("when a record is removed from the left operand", function() {
        context("if the record is not present in the right operand", function() {
          init(function() {
            right_operand = Blog.where({user_id: 'jim'});
          });

          it("triggers remove callbacks with the record", function() {
            var record = Blog.find('recipes');
            record.destroy();
            expect(remove_callback).to(have_been_called, with_args(record));
          });
        });

        context("if the record is present in the right operand", function() {
          it("does not trigger any callbacks", function() {
            var record = Blog.find('recipes');
            record.destroy();
            expect_no_callbacks_to_have_been_called();
          });
        });
      });

      describe("when a record is removed from the right operand", function() {
        context("if the record is not present in the left operand", function() {
          init(function() {
            left_operand = Blog.where({user_id: 'jim'});
          });

          it("does not trigger any callbacks", function() {
            var record = Blog.find('recipes');
            record.destroy();
            expect_no_callbacks_to_have_been_called();
          });
        });

        context("if the record is present in the left operand", function() {
          init(function() {
            right_operand = Blog.where({user_id: 'jan'});
          });

          it("triggers insert callbacks with the record", function() {
            var record = Blog.find({user_id: 'jan'});
            record.update({user_id: 'jonah'})
            expect(insert_callback).to(have_been_called, with_args(record));
          });
        });
      });
    });

    describe("when the difference is between two distinct but compatible relations", function() {
      var difference, left_operand, right_operand, insert_callback, update_callback, remove_callback;

      before(function() {
        Monarch.constructor('A', Monarch.Model.Record);
        Monarch.constructor('B', Monarch.Model.Record);
        A.columns({ projected_id: "string", baz: "string" });
        B.columns({ projected_id: "string", baz: "string" });

        left_operand = A.project(A.projected_id.as('id'), A.baz);
        right_operand = B.project(B.projected_id.as('id'), B.baz);

        difference = new Monarch.Model.Relations.Difference(left_operand, right_operand);

        insert_callback = mock_function('insert_callback');
        update_callback = mock_function('update_callback');
        remove_callback = mock_function('remove_callback');

        difference.on_insert(insert_callback);
        difference.on_update(update_callback);
        difference.on_remove(remove_callback);
      });

      after(function() {
        delete window.A;
        delete window.B;
        delete Repository.tables.as;
        delete Repository.tables.bs;
      });

      it("only considers the 'id' property when performing the difference", function() {
        A.create({projected_id: "foo", baz: "quux"});
        expect(insert_callback).to(have_been_called, once);

        A.find({projected_id: 'foo'}).update({baz: "morning"});
        expect(update_callback).to(have_been_called, once);

        B.create({projected_id: "foo"});
        expect(remove_callback).to(have_been_called, once);

        update_callback.clear();
        var a_record = A.find({projected_id: 'foo'});
        a_record.update({baz: "evening"});
        expect(update_callback).to_not(have_been_called);

        remove_callback.clear();
        a_record.destroy();
        expect(remove_callback).to_not(have_been_called);

        insert_callback.clear();
        A.create({projected_id: "foo", baz: "quux"});
        expect(insert_callback).to_not(have_been_called);
        
        B.find({projected_id: 'foo'}).destroy();
        expect(insert_callback).to(have_been_called, once);
      });
    });
  });
}});
