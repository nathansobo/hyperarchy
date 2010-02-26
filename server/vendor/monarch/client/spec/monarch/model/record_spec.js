//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Record", function() {
    use_local_fixtures();

    describe("when a subsconstructor is declared", function() {
      it("associates the subconstructor with a Table whose #global_name is the underscored subconstructor name", function() {
        var table = Blog.table;
        expect(table.constructor).to(equal, Monarch.Model.Relations.Table);
        expect(table.global_name).to(equal, "blogs");
        expect(table.record_constructor).to(equal, Blog);
      });

      it("automatically gives the subconstructor an 'id' Column with a type of 'string'", function() {
        expect(Blog.id).to(be_an_instance_of, Monarch.Model.Column);
        expect(Blog.id.name).to(equal, "id");
        expect(Blog.id.type).to(equal, "string");
      });

      it("is registered in Repository, and has its table registered in Repository.tables by its global_name", function() {
        expect(Repository.tables.blogs).to(equal, Blog.table);
      });
    });

    describe(".column(name, type)", function() {
      before(function() {
        delete window['Blog'];
        Monarch.ModuleSystem.constructor("Blog", Monarch.Model.Record);
        Blog.column("user_id", "string");
        Blog.column("name", "string");
      });

      it("calls #define_column on its #table, assigning the returned Column to a constructor property", function() {
        expect(Blog.user_id).to(equal, Blog.table.column('user_id'));
      });

      it("associates columns named 'name' with 'name_' on the constructor to evade 'name' being a read-only property in Safari and Chrome", function() {
        expect(Blog.name).to_not(equal, Blog.name_);
        expect(Blog.name_).to(equal, Blog.table.column('name'));
      });

      it("generates a method on .prototype that accesses the field corresponding to the prototype", function() {
        var record = Blog.local_create();

        var field = record.field('user_id');
        expect(field.value()).to(be_undefined);
        expect(record.user_id("jan")).to(equal, "jan");
        expect(field.value()).to(equal, "jan");
        expect(record.user_id()).to(equal, "jan");
      });
    });

    describe(".columns(column_definitions)", function() {
      it("calls .column for every column-name/value pair in the given hash", function() {
        mock(Blog, 'column');

        Blog.columns({
          id: "string",
          name: "string"
        });

        expect(Blog.column).to(have_been_called, twice);
        expect(Blog.column.call_args[0]).to(equal, ['id', 'string']);
        expect(Blog.column.call_args[1]).to(equal, ['name', 'string']);
      });
    });

    describe(".synthetic_column(name, definition)", function() {
      it("causes tuples to have synthetic fields that are based on signals returned by the definition", function() {
        var record = Blog.find('recipes')
        expect(record.fun_profit_name()).to(equal, record.name() + " for Fun and Profit");
      });
    });

    describe(".relates_to_many(name, definition)", function() {
      it("associates a method with the relation returned by the definition function", function() {
        var user = User.find('jan');
        var relation = user.blogs2();
        expect(relation.predicate).to(equal, Blog.user_id.eq("jan"));
      });
    });

    describe(".has_many(plural_target_table_name)", function() {
      it("uses .relates_to_many to make a has-many relation", function() {
        var user = User.find('jan');
        var relation = user.blogs();
        expect(relation.predicate).to(equal, Blog.user_id.eq("jan"));
      });

      it("is updated correctly if the id of the record changes after the relation is instantiated", function() {
        var user = User.local_create({name: "Burt Smith"});
        expect(user.blogs().predicate.right_operand).to(be_null);
        user.save();
        expect(user.blogs().predicate.right_operand).to(equal, user.id());
      });

      context("if a single 'order_by' column is supplied in the options", function() {
        it("constructs an ordered has_many relation ordered by that one column", function() {
          User.has_many('blogs', { order_by: "name desc" });
          var user = User.local_create({id: "jerry"});
          var ordering = user.blogs();
          expect(ordering.constructor).to(equal, Monarch.Model.Relations.Ordering);
          expect(ordering.order_by_columns[0].column).to(equal, Blog.name_);
          expect(ordering.order_by_columns[0].direction).to(equal, "desc");
        });
      });

      context("if multiple 'order_by' columns are supplied in the options", function() {
        it("constructs an ordered has_many relation ordered by those columns", function() {
          User.has_many('blogs', { order_by: ["name desc", "user_id"]});
          var user = User.local_create({id: "jerry"});
          var ordering = user.blogs();
          expect(ordering.constructor).to(equal, Monarch.Model.Relations.Ordering);
          expect(ordering.order_by_columns.length).to(equal, 2);
          expect(ordering.order_by_columns[0].column).to(equal, Blog.name_);
          expect(ordering.order_by_columns[0].direction).to(equal, "desc");
          expect(ordering.order_by_columns[1].column).to(equal, Blog.user_id);
          expect(ordering.order_by_columns[1].direction).to(equal, "asc");
        });
      });

      context("if a conditions hash is supplied in the options", function() {
        it("constrains the generated relation by the conditions", function() {
          User.has_many('blogs', { conditions: { name: "My Blog" }});
          var user = User.local_create({id: 'jake'});
          expect(user.blogs().empty()).to(be_true);
          user.blogs().local_create();
          expect(user.blogs().size()).to(equal, 1);
          expect(user.blogs().first().name()).to(equal, "My Blog");
        });
      });

      context("if a 'table' option is provided", function() {
        it("uses the named table instead of trying to infer it from the name of the relation", function() {
          User.has_many('blogs_o_rama', { table: 'blogs' });
          var user = User.local_create({id: 'jake'});
          user.blogs_o_rama().local_create();
          expect(user.blogs_o_rama().empty()).to(be_false);
        });
      });

      context("if a 'key' option is provided", function() {
        it("uses the named foreign key instead of trying to infer it from the name of the model on which the relation is being defined", function() {
          User.has_many('blogs', { key: 'owner_id' });
          var user = User.local_create({id: 'jake'});
          var blog = user.blogs().local_create();
          expect(blog.owner_id()).to(equal, 'jake');
        });
      });
    });
    
    describe(".local_create(field_values)", function() {
      it("builds an instance of the Record with the given field_values and inserts it in .table before returning it", function() {
        mock(Blog.table, 'insert');
        var record = Blog.local_create({
          id: 'index',
          name: 'Index Cards'
        });
        expect(Blog.table.insert).to(have_been_called, with_args(record));
        expect(record.id()).to(equal, 'index');
        expect(record.name()).to(equal, 'Index Cards');
      });

      it("calls #after_local_create if it is defined on the record's prototype", function() {
        Blog.prototype.after_local_create = mock_function('optional after_local_create hook');
        var record = Blog.local_create();
        expect(record.after_local_create).to(have_been_called);
        delete Blog.prototype.after_local_create;
      });

      it("does not trigger update events on the record or its table", function() {
        var update_callback = mock_function("update callback");
        Blog.table.on_remote_update(update_callback);
        Blog.table.on_local_update(update_callback);
        Blog.prototype.after_remote_update = update_callback;
        Blog.prototype.after_local_update = update_callback;

        var record = Blog.local_create({
          id: 'index',
          name: 'Index Cards'
        });

        expect(update_callback).to_not(have_been_called);
      });

      it("makes the record findable by id if one is provided, but waits for the remote save if the the id is initially undefined", function() {
        var record = Blog.local_create({
          id: 'tina',
          name: 'What Ever Happened To Tina Turner?'
        });

        var record_2 = Blog.local_create({
          name: 'Ike For President'
        });

        expect(Blog.find('tina')).to(equal, record);
        expect(undefined in Blog.table.tuples_by_id).to(be_false);

        record_2.save();
        expect(Blog.find(record_2.id())).to(equal, record_2)
      });
    });

    describe("#local_update(values_by_method)", function() {
      it("calls setter methods for each key in the given hash and fires update callbacks with all changes", function() {
        var record = Blog.find('recipes');

        var table_update_callback = mock_function('table_update_callback');
        var record_update_callback = mock_function('record_update_callback');

        Blog.on_local_update(table_update_callback);
        record.on_local_update(record_update_callback);
        record.after_local_update = mock_function('optional after_local_update hook');
        record.other_method = mock_function('other method');

        var started_at = Date();

        var name_before = record.name();
        var fun_profit_name_before = record.fun_profit_name();
        var user_id_before = record.user_id();
        var started_at_before = record.started_at();

        record.local_update({
          name: 'Pesticides',
          user_id: 'jan',
          other_method: "foo"
        });

        expect(record.name()).to(equal, 'Pesticides');
        expect(record.user_id()).to(equal, 'jan');
        expect(record.other_method).to(have_been_called, with_args("foo"));

        var expected_changeset = {
          name: {
            column: Blog.name_,
            old_value: name_before,
            new_value: record.name()
          },
          fun_profit_name: {
            column: Blog.fun_profit_name,
            old_value: fun_profit_name_before,
            new_value: record.fun_profit_name()
          },
          user_id: {
            column: Blog.user_id,
            old_value: user_id_before,
            new_value: record.user_id()
          }
        };

        expect(table_update_callback).to(have_been_called, once);
        expect(table_update_callback).to(have_been_called, with_args(record, expected_changeset));
        expect(record_update_callback).to(have_been_called, with_args(expected_changeset));
        expect(record.after_local_update).to(have_been_called, with_args(expected_changeset));
      });
    });

    describe("field value accessor functions", function() {
      var record;
      before(function() {
        record = Blog.find('recipes');
      });

      they("trigger optional on_local_update hooks on the record and on_local_update callbacks the record and its table when a new value is assigned", function() {
        var table_update_callback = mock_function('table update callback')
        var record_update_callback = mock_function('record update callback')
        Blog.on_local_update(table_update_callback);
        record.on_local_update(record_update_callback);
        record.after_local_update = mock_function("optional after_local_update hook");

        record.name('Pesticides');

        var expected_changeset = {
          fun_profit_name: {
            column: Blog.fun_profit_name,
            old_value: 'Recipes from the Front for Fun and Profit',
            new_value: 'Pesticides for Fun and Profit'
          },
          name: {
            column: Blog.name_,
            old_value: 'Recipes from the Front',
            new_value: 'Pesticides'
          }
        };

        expect(table_update_callback).to(have_been_called, once);
        expect(table_update_callback).to(have_been_called, with_args(record, expected_changeset));
        expect(record_update_callback).to(have_been_called, with_args(expected_changeset));
        expect(record.after_local_update).to(have_been_called, with_args(expected_changeset));

        table_update_callback.clear();
        record_update_callback.clear();
        record.after_local_update.clear();
        record.name('Pesticides');

        expect(table_update_callback).to_not(have_been_called);
        expect(record_update_callback).to_not(have_been_called);
        expect(record.after_local_update).to_not(have_been_called);
      });

      they("can assign null", function() {
        record.name(null);
        expect(record.name()).to(be_null);
      });

      they("can read synthetic fields", function() {
        expect(record.fun_profit_name()).to(equal, record.field('fun_profit_name').value());
      });

      they("can write synthetic fields if a setter method is defined for the column", function() {
        record.fun_profit_name("Eating Fortune Cookies");
        expect(record.fun_profit_name()).to(equal, "Eating Fortune Cookies in Bed for Fun and Profit");
      });
    });

    describe("#local_destroy", function() {
      it("causes the record to be dirty and no longer appear in queries or finds", function() {
        var record = User.find('jan');
        record.local_destroy();
        expect(record.dirty()).to(be_true);
        expect(User.any(function(user) { return user === record; })).to(be_false);
        expect(User.find('jan')).to(be_null);
      });
    });

    describe("#remotely_destroyed", function() {
      it("removes the Record from its Table and calls #after_remote_destroy if it is defined", function() {
        var record = User.find('jan');
        record.after_remote_destroy = mock_function('after destroy hook');

        record.remotely_destroyed();
        expect(User.find('jan')).to(be_null);

        expect(record.after_remote_destroy).to(have_been_called);
      });
    });

    describe("#on_dirty and #on_clean", function() {
      they("cause the given callback to be triggered when the record becomes dirty or clean relative to the remote fieldset", function() {
        var record = User.find('jan');
        
        expect(record.dirty()).to(be_false);
        expect(record.local._dirty).to(be_false);

        var on_dirty_callback = mock_function("on_dirty_callback");
        var on_clean_callback = mock_function("on_clean_callback");
        record.on_dirty(on_dirty_callback);
        record.on_clean(on_clean_callback);

        var full_name_before = record.full_name();
        record.full_name("Johan Sebastian Bach");
        expect(on_dirty_callback).to(have_been_called, once);
        on_dirty_callback.clear();

        record.full_name(full_name_before);
        expect(on_clean_callback).to(have_been_called, once);
        on_clean_callback.clear();

        record.full_name("Karl Jung");
        record.save();
        expect(on_clean_callback).to(have_been_called, once);
        on_clean_callback.clear();
      });
    });

    describe("when a synthetic field changes", function() {
      it("triggers update callbacks on the table of its record", function() {
        var record = Blog.find('recipes');
        var update_callback = mock_function('update_callback');
        record.table.on_remote_update(update_callback);

        record.name("Farming");
        record.save();

        expect(update_callback).to(have_been_called, once);
      });
    });

    describe("#fetch", function() {
      it("fetches just the current record from the server", function() {
        Server.auto = false;
        var record = Blog.find('recipes');
        record.fetch();

        expect(Server.fetches.length).to(equal, 1);
        var fetched_relation = Server.last_fetch.relations[0];
        expect(fetched_relation.constructor).to(equal, Monarch.Model.Relations.Selection);
        expect(fetched_relation.operand).to(equal, Blog.table);
        expect(fetched_relation.predicate.left_operand).to(equal, Blog.id);
        expect(fetched_relation.predicate.right_operand).to(equal, 'recipes');
      });
    });

    describe("#valid()", function() {
      it("returns false if there are any validation errors", function() {
        var record = Blog.find('recipes');
        expect(record.valid()).to(be_true);
        record.local.field('name').validation_errors = ["Bad name"];
        expect(record.valid()).to(be_false);
      });
    });

    describe("#assign_validation_errors(errors_by_field_name)", function() {
      it("triggers #on_invalid callbacks and assigns the validation errors to the specified fields", function() {
        var record = Blog.find('recipes');
        var on_invalid_callback = mock_function('on_invalid_callback', function() {
          expect(record.field("name").validation_errors).to(equal, ["name error 1", "name error 2"]);
          expect(record.field("user_id").validation_errors).to(equal, ["user error"]);
        });
        var subscription = record.on_invalid(on_invalid_callback);

        record.assign_validation_errors({
          name: ["name error 1", "name error 2"],
          user_id: ["user error"]
        });

        expect(on_invalid_callback).to(have_been_called);
        subscription.destroy();

        record.assign_validation_errors({
          name: ["name error 3"]
        });

        expect(record.field("name").validation_errors).to(equal, ["name error 3"]);
        expect(record.field("user_id").validation_errors).to(be_empty);
      });
    });

    describe("#field(field_name_or_column)", function() {
      it("returns the field for the given column name or Column", function() {
        var record = Blog.find('recipes');

        var field = record.field(Blog.id);
        expect(field.fieldset.record).to(equal, record);
        expect(field.column).to(equal, Blog.id);

        field = record.field('id');
        expect(field.fieldset.record).to(equal, record);
        expect(field.column).to(equal, Blog.id);
      });
    });

    describe("#remotely_updated", function() {
      it("does not cause a record to become valid unless the updated field values cause invalid local fields to become clean", function() {
        var record = Blog.find('recipes');
        record.name("Sharon's Sad Laptop");
        record.assign_validation_errors({name: ['It no good name']});

        expect(record.valid()).to(be_false);

        record.remotely_updated({ user_id: 'sharon' });
        expect(record.valid()).to(be_false);

        record.remotely_updated({ name: "Sharon's Brand New Laptop" });
        expect(record.valid()).to(be_true);
      });
    });
  });
}});
