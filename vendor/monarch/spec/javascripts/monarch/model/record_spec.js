//= require monarch_spec_helper

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Record", function() {
    useLocalFixtures();

    describe("when a subsconstructor is declared", function() {
      it("associates the subconstructor with a Table whose #globalName is the underscored subconstructor name", function() {
        var table = Blog.table;
        expect(table.constructor).to(eq, Monarch.Model.Relations.Table);
        expect(table.globalName).to(eq, "blogs");
        expect(table.recordConstructor).to(eq, Blog);
      });

      it("automatically gives the subconstructor an 'id' Column with a type of 'string'", function() {
        expect(Blog.id).to(beAnInstanceOf, Monarch.Model.Column);
        expect(Blog.id.name).to(eq, "id");
        expect(Blog.id.type).to(eq, "key");
      });

      it("is registered in Repository, and has its table registered in Repository.tables by its globalName", function() {
        expect(Repository.tables.blogs).to(eq, Blog.table);
      });
    });

    describe(".column(name, type)", function() {
      before(function() {
        delete window['Blog'];
        _.constructor("Blog", Monarch.Model.Record);
        Blog.column("userId", "string");
        Blog.column("name", "string");
      });

      it("calls #defineColumn on its #table, assigning the returned Column to a constructor property", function() {
        expect(Blog.userId).to(eq, Blog.table.column('userId'));
      });

      it("associates columns named 'name' with 'name' on the constructor to evade 'name' being a read-only property in Safari and Chrome", function() {
        expect(Blog.name_).toNot(equal, Blog.name);
        expect(Blog.name_).to(eq, Blog.table.column('name'));
      });

      it("generates a method on .prototype that accesses the field corresponding to the prototype", function() {
        var record = Blog.createFromRemote({id: 1});

        var field = record.field('userId');
        expect(field.value()).to(beUndefined);
        expect(record.userId("jan")).to(eq, "jan");
        expect(field.value()).to(eq, "jan");
        expect(record.userId()).to(eq, "jan");
      });
    });

    describe(".columns(columnDefinitions)", function() {
      it("calls .column for every column-name/value pair in the given hash", function() {
        mock(Blog, 'column');

        Blog.columns({
          id: "string",
          name: "string"
        });

        expect(Blog.column).to(haveBeenCalled, twice);
        expect(Blog.column.callArgs[0]).to(equal, ['id', 'string']);
        expect(Blog.column.callArgs[1]).to(equal, ['name', 'string']);
      });
    });

    describe(".syntheticColumn(name, definition)", function() {
      it("causes tuples to have synthetic fields that are based on signals returned by the definition", function() {
        var record = Blog.fixture('recipes')
        expect(record.funProfitName()).to(eq, record.name() + " for Fun and Profit");
      });
    });

    describe(".relatesToMany(name, definition)", function() {
      it("associates a method with the relation returned by the definition function", function() {
        var user = User.fixture('jan');
        var relation = user.blogs2();
        expect(relation.predicate).to(equal, Blog.userId.eq("jan"));
      });
    });

    describe(".hasMany(pluralTargetTableName)", function() {
      it("uses .relatesToMany to make a has-many relation", function() {
        var user = User.fixture('jan');
        var relation = user.blogs();
        expect(relation.predicate).to(equal, Blog.userId.eq("jan"));
      });

      it("is updated correctly if the id of the record changes after the relation is instantiated", function() {
        var user = User.createFromRemote({name: "Burt Smith"});
        expect(user.blogs().predicate.rightOperand).to(beNull);
        user.save();
        expect(user.blogs().predicate.rightOperand).to(eq, user.id());
      });

      context("if a single 'orderBy' column is supplied in the options", function() {
        it("constructs an ordered hasMany relation ordered by that one column", function() {
          User.hasMany('blogs', { orderBy: "name desc" });
          var user = User.createFromRemote({id: "jerry"});
          var ordering = user.blogs();
          expect(ordering.constructor).to(eq, Monarch.Model.Relations.Ordering);
          expect(ordering.sortSpecifications[0].column).to(eq, Blog.name_);
          expect(ordering.sortSpecifications[0].direction).to(eq, "desc");
        });
      });

      context("if multiple 'orderBy' columns are supplied in the options", function() {
        it("constructs an ordered hasMany relation ordered by those columns", function() {
          User.hasMany('blogs', { orderBy: ["name desc", "userId"]});
          var user = User.createFromRemote({id: "jerry"});
          var ordering = user.blogs();
          expect(ordering.constructor).to(eq, Monarch.Model.Relations.Ordering);
          expect(ordering.sortSpecifications.length).to(eq, 3); // because sorting by id last is implicit
          expect(ordering.sortSpecifications[0].column).to(eq, Blog.name_);
          expect(ordering.sortSpecifications[0].direction).to(eq, "desc");
          expect(ordering.sortSpecifications[1].column).to(eq, Blog.userId);
          expect(ordering.sortSpecifications[1].direction).to(eq, "asc");
        });
      });

      context("if a conditions hash is supplied in the options", function() {
        it("constrains the generated relation by the conditions", function() {
          User.hasMany('blogs', { conditions: { name: "My Blog" }});
          var user = User.createFromRemote({id: 'jake'});
          expect(user.blogs().empty()).to(beTrue);
          user.blogs().createFromRemote();
          expect(user.blogs().size()).to(eq, 1);
          expect(user.blogs().first().name()).to(eq, "My Blog");
        });
      });

      context("if a 'constructorName' option is provided", function() {
        it("uses the table associated with that constructor instead of trying to infer it from the name of the relation", function() {
          User.hasMany('blogsORama', { constructorName: 'Blog' });
          var user = User.createFromRemote({id: 'jake'});
          user.blogsORama().createFromRemote();
          expect(user.blogsORama().empty()).to(beFalse);
        });
      });

      context("if a 'key' option is provided", function() {
        it("uses the named foreign key instead of trying to infer it from the name of the model on which the relation is being defined", function() {
          User.hasMany('blogs', { key: 'ownerId' });
          var user = User.createFromRemote({id: 'jake'});
          var blog = user.blogs().createFromRemote();
          expect(blog.ownerId()).to(eq, 'jake');
        });
      });

      context("if extend is called on the return value of the hasMany", function() {
        it("extends the defined relation with the properties passed to extend", function() {
          User.hasMany('blogs').extend({
            foo: function() {
              return "foo";
            }
          });
          var user = User.createFromRemote({id: 'jake'});
          expect(user.blogs().foo()).to(equal, "foo");
        });
      });
    });

    describe(".belongsTo", function() {
      it("defines a reader/writer for the model referred to by the foreign key", function() {
        var blog = Blog.fixture('recipes');
        var newUser = User.fixture('wil');
        expect(blog.user()).to(eq, User.find(blog.userId()));
        expect(blog.user()).toNot(eq, newUser);
        expect(blog.user(newUser)).to(eq, newUser);
        expect(blog.userId()).to(eq, newUser.id());
        expect(blog.user()).to(eq, newUser);
      });

      it("returns null if the foreign key is null", function() {
        var blog = Blog.fixture('recipes');
        blog.userId(null);
        expect(blog.user()).to(beNull);
      });
    });

    describe("#localUpdate(valuesByMethod)", function() {
      it("calls setter methods for each key in the given hash and fires update callbacks with all changes", function() {
        var record = Blog.fixture('recipes');

        var recordUpdateCallback = mockFunction('recordUpdateCallback');

        record.onLocalUpdate(recordUpdateCallback);
        record.afterLocalUpdate = mockFunction('optional afterLocalUpdate hook');
        record.otherMethod = mockFunction('other method');

        var startedAt = Date();

        var nameBefore = record.name();
        var funProfitNameBefore = record.funProfitName();
        var userIdBefore = record.userId();
        var startedAtBefore = record.startedAt();

        record.localUpdate({
          name: 'Pesticides',
          userId: 'jan',
          otherMethod: "foo"
        });

        expect(record.name()).to(eq, 'Pesticides');
        expect(record.userId()).to(eq, 'jan');
        expect(record.otherMethod).to(haveBeenCalled, withArgs("foo"));

        var expectedChangeset = {
          name: {
            column: Blog.name_,
            oldValue: nameBefore,
            newValue: record.name()
          },
          funProfitName: {
            column: Blog.funProfitName,
            oldValue: funProfitNameBefore,
            newValue: record.funProfitName()
          },
          userId: {
            column: Blog.userId,
            oldValue: userIdBefore,
            newValue: record.userId()
          }
        };

        expect(recordUpdateCallback).to(haveBeenCalled, withArgs(expectedChangeset));
        expect(record.afterLocalUpdate).to(haveBeenCalled, withArgs(expectedChangeset));
      });
    });

    describe("field value accessor functions", function() {
      var record;
      before(function() {
        record = Blog.fixture('recipes');
      });

      they("trigger optional onLocalUpdate hooks and callbacks on the record when a new value is assigned", function() {
        var recordUpdateCallback = mockFunction('record update callback')
        record.onLocalUpdate(recordUpdateCallback);
        record.afterLocalUpdate = mockFunction("optional afterLocalUpdate hook");

        record.name('Pesticides');

        var expectedChangeset = {
          funProfitName: {
            column: Blog.funProfitName,
            oldValue: 'Recipes from the Front for Fun and Profit',
            newValue: 'Pesticides for Fun and Profit'
          },
          name: {
            column: Blog.name_,
            oldValue: 'Recipes from the Front',
            newValue: 'Pesticides'
          }
        };

        expect(recordUpdateCallback).to(haveBeenCalled, withArgs(expectedChangeset));
        expect(record.afterLocalUpdate).to(haveBeenCalled, withArgs(expectedChangeset));

        recordUpdateCallback.clear();
        record.afterLocalUpdate.clear();
        record.name('Pesticides');

        expect(recordUpdateCallback).toNot(haveBeenCalled);
        expect(record.afterLocalUpdate).toNot(haveBeenCalled);
      });

      they("can assign null", function() {
        record.name(null);
        expect(record.name()).to(beNull);
      });

      they("can read synthetic fields", function() {
        expect(record.funProfitName()).to(eq, record.field('funProfitName').value());
      });

      they("can write synthetic fields if a setter method is defined for the column", function() {
        record.funProfitName("Eating Fortune Cookies");
        expect(record.funProfitName()).to(eq, "Eating Fortune Cookies in Bed for Fun and Profit");
      });
    });

    describe("#remotelyDestroyed", function() {
      it("removes the Record from its Table and calls #afterRemoteDestroy if it is defined", function() {
        var record = User.fixture('jan');
        record.afterRemoteDestroy = mockFunction('after destroy hook');

        record.remotelyDestroyed();
        expect(User.find('jan')).to(beNull);

        expect(record.afterRemoteDestroy).to(haveBeenCalled);
      });
    });

    describe("#onDirty and #onClean", function() {
      they("cause the given callback to be triggered when the record becomes dirty or clean relative to the remote fieldset", function() {
        var record = User.fixture('jan');
        
        expect(record.dirty()).to(beFalse);
        expect(record.local.Dirty).to(beFalse);

        var onDirtyCallback = mockFunction("onDirtyCallback");
        var onCleanCallback = mockFunction("onCleanCallback");
        record.onDirty(onDirtyCallback);
        record.onClean(onCleanCallback);

        var fullNameBefore = record.fullName();
        record.fullName("Johan Sebastian Bach");
        expect(onDirtyCallback).to(haveBeenCalled, once);
        onDirtyCallback.clear();

        record.fullName(fullNameBefore);
        expect(onCleanCallback).to(haveBeenCalled, once);
        onCleanCallback.clear();

        record.fullName("Karl Jung");
        record.save();
        expect(onCleanCallback).to(haveBeenCalled, once);
        onCleanCallback.clear();
      });
    });

    describe("when a synthetic field changes", function() {
      it("triggers update callbacks on the table of its record", function() {
        var record = Blog.fixture('recipes');
        var updateCallback = mockFunction('updateCallback');
        record.table.onUpdate(updateCallback);

        record.name("Farming");
        record.save();

        expect(updateCallback).to(haveBeenCalled, once);
      });

      it("can become dirty if it does not match its remote counterpart", function() {
        var record = Blog.fixture('recipes');
        record.name('Farming');
        expect(record.field('funProfitName').dirty()).to(beTrue);
        record.save();
        expect(record.field('funProfitName').dirty()).to(beFalse);
      });
    });

    describe("#fetch", function() {
      it("fetches just the current record from the server", function() {
        Server.auto = false;
        var record = Blog.fixture('recipes');
        record.fetch();

        expect(Server.fetches.length).to(eq, 1);
        var fetchedRelation = Server.lastFetch.relations[0];
        expect(fetchedRelation.constructor).to(eq, Monarch.Model.Relations.Selection);
        expect(fetchedRelation.operand).to(eq, Blog.table);
        expect(fetchedRelation.predicate.leftOperand).to(eq, Blog.id);
        expect(fetchedRelation.predicate.rightOperand).to(eq, 'recipes');
      });
    });

    describe("#valid()", function() {
      it("returns false if there are any validation errors", function() {
        var record = Blog.fixture('recipes');
        expect(record.valid()).to(beTrue);
        record.local.field('name').validationErrors = ["Bad name"];
        expect(record.valid()).to(beFalse);
      });
    });

    describe("#assignValidationErrors(errorsByFieldName)", function() {
      it("triggers #onInvalid callbacks and assigns the validation errors to the specified fields", function() {
        var record = Blog.fixture('recipes');
        var onInvalidCallback = mockFunction('onInvalidCallback', function() {
          expect(record.field("name").validationErrors).to(equal, ["name error 1", "name error 2"]);
          expect(record.field("userId").validationErrors).to(equal, ["user error"]);
        });
        var subscription = record.onInvalid(onInvalidCallback);

        record.assignValidationErrors({
          name: ["name error 1", "name error 2"],
          userId: ["user error"]
        });

        expect(onInvalidCallback).to(haveBeenCalled);
        subscription.destroy();

        record.assignValidationErrors({
          name: ["name error 3"]
        });

        expect(record.field("name").validationErrors).to(equal, ["name error 3"]);
        expect(record.field("userId").validationErrors).to(beEmpty);
      });
    });

    describe("#field(fieldNameOrColumn)", function() {
      it("returns the field for the given column name or Column", function() {
        var record = Blog.fixture('recipes');

        var field = record.field(Blog.id);
        expect(field.fieldset.record).to(eq, record);
        expect(field.column).to(eq, Blog.id);

        field = record.field('id');
        expect(field.fieldset.record).to(eq, record);
        expect(field.column).to(eq, Blog.id);
      });
    });

    describe("#remotelyUpdated", function() {
      it("does not cause a record to become valid unless the updated field values cause invalid local fields to become clean", function() {
        var record = Blog.fixture('recipes');
        record.name("Sharon's Sad Laptop");
        record.assignValidationErrors({name: ['It no good name']});

        expect(record.valid()).to(beFalse);

        record.remotelyUpdated({ userId: 'sharon' });
        expect(record.valid()).to(beFalse);

        record.remotelyUpdated({ name: "Sharon's Brand New Laptop" });
        expect(record.valid()).to(beTrue);
      });
    });
  });
}});
