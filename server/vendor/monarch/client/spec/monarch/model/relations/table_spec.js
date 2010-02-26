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

    describe("#wire_representation", function() {
      it("contains the Table's #name and has the 'type' of 'table'", function() {
        expect(table.wire_representation()).to(equal, {
          type: "table",
          name: "programming_languages"
        });
      });
    });

    describe("delta event callback registration methods", function() {
      describe("#on_remote_insert(callback)", function() {
        it("returns a Monarch.Subscription for the #on_remote_insert_node", function() {
          var subscription = User.table.on_remote_insert(mock_function);
          expect(subscription.node).to(equal, User.table.on_remote_insert_node);
        });
      });

      describe("#on_remote_remove(callback)", function() {
        it("returns a Monarch.Subscription for the #on_remote_remove_node", function() {
          var subscription = User.table.on_remote_remove(function() {
          });
          expect(subscription.node).to(equal, User.table.on_remote_remove_node);
        });
      });

      describe("#on_remote_update(callback)", function() {
        it("returns a Monarch.Subscription for the #on_remote_update_node", function() {
          var subscription = User.table.on_remote_update(function() {
          });
          expect(subscription.node).to(equal, User.table.on_remote_update_node);
        });
      });
    });

    describe("#has_subscribers()", function() {
      context("if a callback has been registered", function() {
        scenario("with #on_remote_insert", function() {
          before(function() {
            User.table.on_remote_insert(mock_function());
          });
        });

        scenario("with #on_remote_update", function() {
          before(function() {
            User.table.on_remote_update(mock_function());
          });
        });

        scenario("with #on_remote_remove", function() {
          before(function() {
            User.table.on_remote_remove(mock_function());
          });
        });

        scenario("with #on_dirty", function() {
          before(function() {
            User.table.on_dirty(mock_function());
          });
        });

        scenario("with #on_clean", function() {
          before(function() {
            User.table.on_clean(mock_function());
          });
        });

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
        it("triggers #on_remote_insert callbacks with the inserted record", function() {
          var insert_callback = mock_function("insert callback");
          User.table.on_remote_insert(insert_callback);

          User.create({id: "emma", full_name: "Emma Cunningham"})
            .after_events(function(record) {
              expect(insert_callback).to(have_been_called, once);
              expect(insert_callback).to(have_been_called, with_args(record));
            });
        });
      });

      describe("when a record in the Table is removed", function() {
        it("triggers #on_remote_remove callbacks with the removed record", function() {
          var remove_callback = mock_function("remove callback");
          User.table.on_remote_remove(remove_callback);

          var record = User.find("jan");
          User.table.remove(record);

          expect(remove_callback).to(have_been_called, once);
          expect(remove_callback).to(have_been_called, with_args(record));
        });
      });

      describe("when a record in the Table is updated", function() {
        it("triggers #on_remote_update callbacks with the updated record and a changed attributes object", function() {
          var update_callback = mock_function("update callback");
          User.table.on_remote_update(update_callback);

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

    describe("dirty / clean callback triggering", function() {
      use_local_fixtures();

      it("fires dirty / clean callbacks when a record in the table becomes dirty or clean", function() {
        var dirty_callback = mock_function('dirty_callback');
        var clean_callback = mock_function('clean_callback');

        User.table.on_dirty(dirty_callback);
        User.table.on_clean(clean_callback);

        var user = User.find('jan');
        var full_name_before = user.full_name();

        user.full_name("Mahatma Ghandi");
        expect(dirty_callback).to(have_been_called, with_args(user));

        user.full_name(full_name_before);
        expect(clean_callback).to(have_been_called, with_args(user));
      });
    });

    describe("#pause_events and #resume_events", function() {
      specify("#pause_events delays #on_remote_insert, #on_remote_remove, and #on_remote_update triggers until #resume_events is called. Then delayed events are flushed and future events are no longer delayed", function() {
        var insert_callback = mock_function("insert callback");
        var update_callback = mock_function("update callback");
        var remove_callback = mock_function("remove callback");

        User.table.on_remote_insert(insert_callback);
        User.table.on_remote_update(update_callback);
        User.table.on_remote_remove(remove_callback);

        User.table.pause_events();

        var record = User.local_create({id: "jake", full_name: "Jake Frautschi"});
        record.remotely_created({id: "jake", full_name: "Jake Frautschi"});
        record.remote.update({ full_name: "Jacob Frautschi" });
        record.local_destroy();
        record.remotely_destroyed();

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
        record_2.remotely_created({id: "nathan", full_name: "Nathan Sobo"});

        expect(insert_callback).to(have_been_called, once);
        expect(insert_callback).to(have_been_called, with_args(record_2));

        record_2.remote.update({full_name: "Nate Sobo"});
        expect(update_callback).to(have_been_called, once);

        record_2.remotely_destroyed();
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
