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

      it("does not trigger update events on its Table", function() {
        var update_callback = mock_function("update callback");
        Blog.table.on_update(update_callback);

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
      it("causes the record to be dirty and no longer appear in queries or finds", function() {
        var record = User.find('jan');
        record.local_destroy();
        expect(record.dirty()).to(be_true);
        expect(User.any(function(user) { return user === record; })).to(be_false);
        expect(User.find('jan')).to(be_null);
      });
    });

    describe("#finalize_local_destroy", function() {
      it("removes the Record from its Table and calls #after_destroy if it is defined", function() {
        var record = User.find('jan');
        record.after_destroy = mock_function('after destroy hook');

        record.finalize_local_destroy();
        expect(User.find('jan')).to(be_null);

        expect(record.after_destroy).to(have_been_called);
      });
    });

    describe("#local_update(values_by_method)", function() {
      it("calls setter methods for each key in the given hash", function() {
        var record = Blog.find('recipes');
        record.other_method = mock_function('other method');

        record.local_update({
          name: 'Pesticides',
          user_id: 'jan',
          other_method: 'foo'
        });

        expect(record.name()).to(equal, 'Pesticides');
        expect(record.user_id()).to(equal, 'jan');
        expect(record.other_method).to(have_been_called, with_args('foo'));
      });
    });

    describe("when a synthetic field changes", function() {
      it("triggers update callbacks on the table of its record", function() {
        var record = Blog.find('recipes');
        var update_callback = mock_function('update_callback');
        record.table().on_update(update_callback);

        record.name("Farming");
        record.save();

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
        record.save();

        expect(update_callback).to(have_been_called, once);
        expect(update_callback).to(have_been_called, with_args(record, {
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
        }));

        update_callback.clear();

        record.name('Pesticides');
        record.save();
        
        expect(update_callback).to_not(have_been_called);
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
  });
}});
