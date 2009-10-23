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
      });

      it("calls #define_column on its #table, assigning the returned Column to a constructor property", function() {
        expect(Blog.user_id).to(equal, Blog.table.columns_by_name.user_id);
      });

      it("generates a method on .prototype that accesses the field corresponding to the prototype", function() {
        var record = new Blog();

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
      it("causes records to have synthetic fields that are based on signals returned by the definition", function() {
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

      context("if a single 'order_by' column is supplied in the options", function() {
        it("constructs an ordered has_many relation ordered by that one column", function() {
          User.has_many('blogs', { order_by: "name desc" });
          var user = User.local_create({id: "jerry"});
          var ordering = user.blogs();
          expect(ordering.constructor).to(equal, Monarch.Model.Relations.Ordering);
          expect(ordering.order_by_columns[0].column).to(equal, Blog.name);
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
          expect(ordering.order_by_columns[0].column).to(equal, Blog.name);
          expect(ordering.order_by_columns[0].direction).to(equal, "desc");
          expect(ordering.order_by_columns[1].column).to(equal, Blog.user_id);
          expect(ordering.order_by_columns[1].direction).to(equal, "asc");
        });
      });
    });
    
    describe(".local_create(field_values)", function() {
      it("builds an instance of the Record with the given field_values and inserts it in .table before returning it", function() {
        mock(Blog.table, 'insert');
        var record = Blog.local_create({
          id: 'recipes',
          name: 'Recipes'
        });
        expect(Blog.table.insert).to(have_been_called, with_args(record));
        expect(record.id()).to(equal, 'recipes');
        expect(record.name()).to(equal, 'Recipes');
      });

      it("does not trigger update events on its Table", function() {
        var update_callback = mock_function("update callback");
        Blog.table.on_update(update_callback);

        var record = Blog.local_create({
          id: 'recipes',
          name: 'Recipes'
        });

        expect(update_callback).to_not(have_been_called);
      });
    });

    describe("#initialize(field_values_by_column_name={})", function() {
      it("assigns the given field values to their respective Fields", function() {
        var record = new Blog({
          id: "recipes",
          name: "Recipes"
        });

        expect(record.id()).to(equal, "recipes");
        expect(record.name()).to(equal, "Recipes");
      });
    });

    describe("#local_destroy", function() {
      it("removes the Record from its Table", function() {
        var record = User.find('jan');
        record.local_destroy();
        expect(User.find('jan')).to(be_null);
      });
    });

    describe("#local_update(values_by_method)", function() {
      it("calls setter methods for each key in the given hash and fires update callbacks on its Table with all the changed attributes", function() {
        var record = Blog.find('recipes');
        record.other_method = mock_function('other method');

        var update_callback = mock_function('update_callback');
        record.table().on_update(update_callback);

        record.local_update({
          id: 'recipes',
          name: 'Pesticides',
          user_id: 'jan',
          other_method: 'foo'
        });

        expect(record.name()).to(equal, 'Pesticides');
        expect(record.user_id()).to(equal, 'jan');
        expect(record.other_method).to(have_been_called, with_args('foo'));

        expect(update_callback).to(have_been_called, with_args(record, {
          fun_profit_name: {
            column: Blog.fun_profit_name,
            old_value: 'Recipes from the Front for Fun and Profit',
            new_value: 'Pesticides for Fun and Profit'
          },
          name: {
            column: Blog.name,
            old_value: 'Recipes from the Front',
            new_value: 'Pesticides'
          },
          user_id: {
            column: Blog.user_id,
            old_value: 'mike',
            new_value: 'jan'
          }
        }));
      });
    });

    describe("when a synthetic field changes", function() {
      it("triggers update callbacks on the table of its record", function() {
        var record = Blog.find('recipes');
        var update_callback = mock_function('update_callback');
        record.table().on_update(update_callback);

        expect(record.active_fieldset.batch_update_in_progress()).to(be_false);

        record.name("Farming");

        expect(update_callback).to(have_been_called, once);
      });
    });

    describe("column accessor functions", function() {
      var record;
      before(function() {
        record = Blog.find('recipes');
      });

      they("trigger update callbacks on the Record's table when a new value is assigned", function() {
        var update_callback = mock_function('update callback')
        Blog.on_update(update_callback);

        record.name('Pesticides');

        expect(update_callback).to(have_been_called, once);
        expect(update_callback).to(have_been_called, with_args(record, {
          fun_profit_name: {
            column: Blog.fun_profit_name,
            old_value: 'Recipes from the Front for Fun and Profit',
            new_value: 'Pesticides for Fun and Profit'
          },
          name: {
            column: Blog.name,
            old_value: 'Recipes from the Front',
            new_value: 'Pesticides'
          }
        }));

        update_callback.clear();

        record.name('Pesticides');
        expect(update_callback).to_not(have_been_called);
      });
      
      they("can assign null", function() {
        record.name(null);
        expect(record.name()).to(be_null);
      });

      they("can read synthetic fields", function() {
        expect(record.fun_profit_name()).to(equal, record.field('fun_profit_name').value());
      });
    });

    describe("#field", function() {
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

    describe("#wire_representation", function() {
      it("returns the field values by column name", function() {
        var record = Blog.find('recipes');

        expect(record.wire_representation()).to(equal, {
          id: 'recipes',
          name: 'Recipes from the Front',
          user_id: 'mike',
          started_at: record.started_at().getTime()
        });
      });
    });
  });
}});
