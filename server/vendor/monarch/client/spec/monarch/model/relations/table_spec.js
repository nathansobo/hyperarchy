//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Relations.Table", function() {
    use_local_fixtures();

    var table;
    before(function() {
      table = new Monarch.Model.Relations.Table("programming_languages");
    });

    describe("#define_column", function() {
      var column;
      before(function() {
        column = table.define_column("family_id", "string");
      });

      it("adds a Column with the given name and type to #columns_by_name and returns it", function() {
        expect(column).to(equal, table.columns_by_name.family_id);
        expect(column.constructor).to(equal, Monarch.Model.Column);
        expect(column.name).to(equal, 'family_id');
        expect(column.type).to(equal, 'string');
      });
    });

    describe("query methods", function() {
      var locally_created, locally_updated, locally_destroyed, clean_record;
      before(function() {
        clean_record = User.find('mike');
        locally_created = User.local_create({ id: 'barbara' });
        locally_updated = User.find('wil');
        locally_updated.local_update({full_name: "Kaiser Wilhelm"});
        locally_destroyed = User.find('jan');
        locally_destroyed.local_destroy();
      });

      describe("#all_tuples", function() {
        it("returns a copy of all records in the table, including those that are locally created and destroyed", function() {
          var tuples = User.table.all_tuples();

          expect(Monarch.Util.contains(tuples, clean_record)).to(be_true);
          expect(Monarch.Util.contains(tuples, locally_updated)).to(be_true);
          expect(Monarch.Util.contains(tuples, locally_created)).to(be_true);
          expect(Monarch.Util.contains(tuples, locally_destroyed)).to(be_true);

          tuples.push(1);
          expect(User.table.all_tuples()).to_not(equal, tuples);
        });
      });

      describe("#local_tuples", function() {
        it("excludes records that are locally destroyed but includes all others", function() {
          var tuples = User.table.local_tuples();

          expect(Monarch.Util.contains(tuples, locally_destroyed)).to(be_false);
          expect(Monarch.Util.contains(tuples, clean_record)).to(be_true);
          expect(Monarch.Util.contains(tuples, locally_updated)).to(be_true);
          expect(Monarch.Util.contains(tuples, locally_created)).to(be_true);
        });
      });

      describe("#dirty_tuples", function() {
        it("excludes clean records but includes all others", function() {
          var tuples = User.table.dirty_tuples();

          expect(Monarch.Util.contains(tuples, clean_record)).to(be_false);
          expect(Monarch.Util.contains(tuples, locally_created)).to(be_true);
          expect(Monarch.Util.contains(tuples, locally_updated)).to(be_true);
          expect(Monarch.Util.contains(tuples, locally_destroyed)).to(be_true);
        });
      });
    });

    describe("#insert", function() {
      it("adds the given Record to the array returned by #tuples", function() {
        var record = new User();

        expect(User.table.tuples()).to_not(contain, record);
        User.table.insert(record)
        expect(User.table.tuples()).to(contain, record);
      });
    });

    describe("#wire_representation", function() {
      it("contains the Table's #name and has the 'type' of 'table'", function() {
        expect(table.wire_representation()).to(equal, {
          type: "table",
          name: "programming_languages"
        });
      });
    });

    describe("delta event callback registration methods", function() {
      describe("#on_insert(callback)", function() {
        it("returns a Monarch.Subscription for the #on_insert_node", function() {
          var subscription = User.table.on_insert(mock_function);
          expect(subscription.node).to(equal, User.table.on_insert_node);
        });
      });

      describe("#on_remove(callback)", function() {
        it("returns a Monarch.Subscription for the #on_remove_node", function() {
          var subscription = User.table.on_remove(function() {
          });
          expect(subscription.node).to(equal, User.table.on_remove_node);
        });
      });

      describe("#on_update(callback)", function() {
        it("returns a Monarch.Subscription for the #on_update_node", function() {
          var subscription = User.table.on_update(function() {
          });
          expect(subscription.node).to(equal, User.table.on_update_node);
        });
      });
    });

    describe("#has_subscribers()", function() {
      context("if a callback has been registered", function() {
        scenario("with #on_insert", function() {
          before(function() {
            User.table.on_insert(mock_function());
          });
        })

        scenario("with #on_update", function() {
          before(function() {
            User.table.on_update(mock_function());
          });
        })

        scenario("with #on_remove", function() {
          before(function() {
            User.table.on_remove(mock_function());
          });
        })

        it("returns true", function() {
          expect(User.table.has_subscribers()).to(be_true);
        });
      });

      context("if no callbacks have been registered", function() {
        it("returns false", function() {
          expect(User.table.has_subscribers()).to(be_false);
        });
      });
    });

    describe("delta callback triggering", function() {
      use_local_fixtures();

      describe("when a Record is inserted into the Table", function() {
        it("triggers #on_insert callbacks with the inserted record", function() {
          var insert_callback = mock_function("insert callback");
          User.table.on_insert(insert_callback);

          User.create({id: "emma", full_name: "Emma Cunningham"})
            .after_events(function(record) {
              expect(insert_callback).to(have_been_called, once);
              expect(insert_callback).to(have_been_called, with_args(record));
            });
        });
      });

      describe("when a record in the Table is removed", function() {
        it("triggers #on_remove callbacks with the removed record", function() {
          var remove_callback = mock_function("remove callback");
          User.table.on_remove(remove_callback);

          var record = User.find("jan");
          User.table.remove(record);

          expect(remove_callback).to(have_been_called, once);
          expect(remove_callback).to(have_been_called, with_args(record));
        });
      });

      describe("when a record in the Table is updated", function() {
        it("triggers #on_update callbacks with the updated record and a changed attributes object", function() {
          var update_callback = mock_function("update callback");
          User.table.on_update(update_callback);

          var record = User.find("jan");

          var old_value = record.full_name();
          var new_value = old_value + " The Third";

          record.full_name(new_value);
          record.save();

          expect(update_callback).to(have_been_called, once);
          expect(update_callback).to(have_been_called, with_args(record, {
            full_name: {
              column: User.full_name,
              old_value: old_value,
              new_value: old_value + " The Third"
            }
          }));
        });
      });
    });

    describe("#pause_events and #resume_events", function() {
      specify("#pause_events delays #on_insert, #on_remove, and #on_update triggers until #resume_events is called. Then delayed events are flushed and future events are no longer delayed", function() {
        var insert_callback = mock_function("insert callback");
        var update_callback = mock_function("update callback");
        var remove_callback = mock_function("remove callback");

        User.table.on_insert(insert_callback);
        User.table.on_update(update_callback);
        User.table.on_remove(remove_callback);

        User.table.pause_events();

        var record = User.local_create({id: "jake", full_name: "Jake Frautschi"});
        record.finalize_local_create({id: "jake", full_name: "Jake Frautschi"});
        record.remote.update({ full_name: "Jacob Frautschi" });
        record.local_destroy();
        record.finalize_local_destroy();

        expect(insert_callback).to_not(have_been_called);
        expect(update_callback).to_not(have_been_called);
        expect(remove_callback).to_not(have_been_called);

        User.table.resume_events();

        expect(insert_callback).to(have_been_called, with_args(record));
        expect(update_callback).to(have_been_called, once);
        expect(update_callback).to(have_been_called, with_args(record, {
          full_name: {
            column: User.full_name,
            old_value: "Jake Frautschi",
            new_value: "Jacob Frautschi"
          }
        }));
        expect(remove_callback).to(have_been_called, with_args(record));

        insert_callback.clear();
        update_callback.clear();
        remove_callback.clear();

        var record_2 = User.local_create({id: "nathan", full_name: "Nathan Sobo"});
        record_2.finalize_local_create({id: "nathan", full_name: "Nathan Sobo"});

        expect(insert_callback).to(have_been_called, once);
        expect(insert_callback).to(have_been_called, with_args(record_2));

        record_2.remote.update({full_name: "Nate Sobo"});
        expect(update_callback).to(have_been_called, once);

        record_2.finalize_local_destroy();
        expect(remove_callback).to(have_been_called, once);
      });
    });

    describe("#evaluate_in_repository(repository)", function() {
      it("returns the equivalent Table from the given repository", function() {
        var other_repo = Repository.clone_schema();
        var table_in_other_repo = User.table.evaluate_in_repository(other_repo);
        expect(table_in_other_repo).to(equal, other_repo.tables.users);
      });
    });

    describe("#clear", function() {
      it("removes tuples data from the table and its index", function() {
        expect(User.find('jan')).to_not(be_null);
        User.table.clear();
        expect(User.table.empty()).to(be_true);
        expect(User.find('jan')).to(be_null);
      });
    });
  });
}});
