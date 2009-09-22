//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Model.Relations.Table", function() {
    use_local_fixtures();

    var table;
    before(function() {
      table = new Model.Relations.Table("programming_languages");
    });

    describe("#define_column", function() {
      var column;
      before(function() {
        column = table.define_column("family_id", "string");
      });

      it("adds a Column with the given name and type to #columns_by_name and returns it", function() {
        expect(column).to(equal, table.columns_by_name.family_id);
        expect(column.constructor).to(equal, Model.Column);
        expect(column.name).to(equal, 'family_id');
        expect(column.type).to(equal, 'string');
      });
    });

    describe("#all", function() {
      it("returns a copy of the sets records", function() {
        var records_copy = User.table.all();
        records_copy.push(1);
        expect(User.table.all()).to_not(equal, records_copy);
      });
    });

    describe("#insert", function() {
      it("adds the given Record to the array returned by #all", function() {
        var record = new User();

        expect(User.table.all()).to_not(contain, record);
        User.table.insert(record)
        expect(User.table.all()).to(contain, record);
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

    describe("#find(id)", function() {
      it("returns the Record with the given id or null if none exists", function() {
        var record = User.table.find('jan');
        expect(record.id()).to(equal, 'jan');
      });
    });

    describe("delta event callback registration methods", function() {
      describe("#on_insert(callback)", function() {
        it("returns a Subscription for the #on_insert_node", function() {
          var subscription = User.table.on_insert(mock_function);
          expect(subscription.node).to(equal, User.table.on_insert_node);
        });
      });

      describe("#on_remove(callback)", function() {
        it("returns a Subscription for the #on_remove_node", function() {
          var subscription = User.table.on_remove(function() {
          });
          expect(subscription.node).to(equal, User.table.on_remove_node);
        });
      });

      describe("#on_update(callback)", function() {
        it("returns a Subscription for the #on_update_node", function() {
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

          var record = User.local_create({id: "emma", full_name: "Emma Cunningham"});
          expect(insert_callback).to(have_been_called, once);
          expect(insert_callback).to(have_been_called, with_args(record));
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

    describe("#pause_delta_events and #resume_delta_events", function() {
      specify("#pause_delta_events delays #on_insert, #on_remove, and #on_update triggers until #resume_delta_events is called. Then delayed events are flushed and future events are no longer delayed", function() {
        var insert_callback = mock_function("insert callback");
        var update_callback = mock_function("update callback");
        var remove_callback = mock_function("remove callback");

        User.table.on_insert(insert_callback);
        User.table.on_update(update_callback);
        User.table.on_remove(remove_callback);

        User.table.pause_delta_events();

        var record = User.local_create({id: "jake", full_name: "Jake Frautschi"});
        record.full_name("Jacob Frautschi");
        record.destroy();

        expect(insert_callback).to_not(have_been_called);
        expect(update_callback).to_not(have_been_called);
        expect(remove_callback).to_not(have_been_called);

        User.table.resume_delta_events();

        expect(insert_callback).to(have_been_called, with_args(record));
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

        expect(insert_callback).to(have_been_called, once);
        expect(insert_callback).to(have_been_called, with_args(record_2));

        record_2.full_name("Nate Sobo");
        expect(update_callback).to(have_been_called, once);

        record_2.destroy();
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
  });
}});
