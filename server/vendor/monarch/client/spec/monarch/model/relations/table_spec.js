//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Relations.Table", function() {
    useLocalFixtures();

    describe("column definition", function() {
      var table;
      before(function() {
        table = new Monarch.Model.Relations.Table("programmingLanguages");
      });

      describe("#defineColumn", function() {
        var column;
        before(function() {
          column = table.defineColumn("familyId", "string");
        });

        it("adds a Column with the given name and type to #columnsByName and returns it", function() {
          expect(column).to(eq, table.columnsByName.familyId);
          expect(column.constructor).to(eq, Monarch.Model.Column);
          expect(column.name).to(eq, 'familyId');
          expect(column.type).to(eq, 'string');
        });
      });

      describe("#column(name)", function() {
        it("returns the concrete or sythetic column with the given name or null if none exists", function() {
          var concreteColumn = table.defineColumn("foo", "string");
          var syntheticColumn = table.defineSyntheticColumn("bar", function() {});
          expect(table.column("foo")).to(eq, concreteColumn);
          expect(table.column("bar")).to(eq, syntheticColumn);
          expect(table.column("baz")).to(beNull);
        });
      });
    });

    describe("#fetch", function() {
      useFakeServer(false);

      context("when an id is provided", function() {
        it("fetches the record with that id", function() {
          User.table.fetch("jan");
          expect(Server.fetches.length).to(eq, 1);
          var fetchedRelation = Server.lastFetch.relations[0];
          expect(fetchedRelation.isEqual(User.where({id: "jan"}))).to(beTrue);
        });
      });

      context("when no id is provided", function() {
        it("fetches the entire table", function() {
          User.table.fetch();
          expect(Server.fetches.length).to(eq, 1);
          var fetchedRelation = Server.lastFetch.relations[0];
          expect(fetchedRelation).to(eq, User.table);
        });
      });
    });

    describe("#findOrFetch(id, additionalRelations)", function() {
      useFakeServer(false);

      it("looks for a record in with the given id, and fetches it and any additional relations if it is not found, invoking the callback with the record", function() {
        // case where a record with given id is in the repo
        var extantRecord = Blog.find("recipes");

        var onSuccessCallback = mockFunction("onSuccessCallback");
        Blog.findOrFetch("recipes").onSuccess(onSuccessCallback);

        expect(onSuccessCallback).to(haveBeenCalled, once);
        expect(onSuccessCallback).to(haveBeenCalled, withArgs(extantRecord));
        expect(Server.fetches).to(beEmpty);

        // case where a record with that id is not in the local repo
        onSuccessCallback.clear();

        var additionalRelation = BlogPost.where({blogId: "on-server"});
        Blog.findOrFetch("on-server", [additionalRelation]).onSuccess(onSuccessCallback);

        expect(onSuccessCallback).toNot(haveBeenCalled);
        expect(Server.fetches.length).to(eq, 1);
        expect(Server.lastFetch.relations).to(equal, [Blog.where({id: "on-server"}), additionalRelation]);

        Server.lastFetch.simulateSuccess({
          blogs: {
            'on-server': { id: "on-server", name: "Fetched From The Server"}
          }
        });

        expect(onSuccessCallback).to(haveBeenCalled, once);
        expect(onSuccessCallback).to(haveBeenCalled, withArgs(Blog.find('on-server')));
      });
    });

    describe("#clear", function() {
      it("removes tuples data from the table and its index", function() {
        expect(User.find('jan')).toNot(beNull);
        User.table.clear();
        expect(User.table.empty()).to(beTrue);
        expect(User.find('jan')).to(beNull);
      });
    });

    describe("#wireRepresentation", function() {
      it("contains the Table's #name and has the 'type' of 'table'", function() {
        expect(BlogPost.table.wireRepresentation()).to(equal, {
          type: "table",
          name: "blog_posts"
        });
      });
    });

    describe("event handling", function() {
      var insertCallback, removeCallback, updateCallback, dirtyCallback, cleanCallback, invalidCallback, validCallback;
      before(function() {
        insertCallback = mockFunction("insert callback", function(record) {
          expect(User.contains(record)).to(beTrue);
        });
        User.onInsert(insertCallback);

        removeCallback = mockFunction("remove callback", function(record) {
          expect(User.contains(record)).to(beFalse);
        });
        User.onRemove(removeCallback);

        updateCallback = mockFunction("update callback");
        User.onUpdate(updateCallback);

        dirtyCallback = mockFunction('dirtyCallback');
        User.onDirty(dirtyCallback);

        cleanCallback = mockFunction('cleanCallback');
        User.onClean(cleanCallback);
        
        invalidCallback = mockFunction('invalidCallback');
        User.onInvalid(invalidCallback);

        validCallback = mockFunction('validCallback');
        User.onValid(validCallback);
      });

      it("triggers insert, update, and remove events on the table at the appropriate times", function() {
        var record = User.createFromRemote({id: "emma", fullName: "Emma Cunningham"})
        expect(insertCallback).to(haveBeenCalled, withArgs(record));

        record.remotelyUpdated({fullName: "Emma T. Scheme"});
        expect(updateCallback).to(haveBeenCalled, withArgs(record, {
          fullName: {
            column: User.fullName,
            oldValue: "Emma Cunningham",
            newValue: "Emma T. Scheme"
          }
        }));

        record.remotelyDestroyed();
        expect(removeCallback).to(haveBeenCalled, withArgs(record));
      });

      it("triggers dirty and clean events at the appropriate times", function() {
        var record = User.createFromRemote({id: 1, fullName: "Nathan Sobo"})

        record.fullName("Mahatma Ghandi");
        expect(dirtyCallback).to(haveBeenCalled, withArgs(record));

        record.fullName("Nathan Sobo");
        expect(cleanCallback).to(haveBeenCalled, withArgs(record));
      });
      
      it("triggers invalid and valid events at the appropriate times", function() {
        var record = User.createFromRemote({id: 1, fullName: "Nathan Sobo"})
        record.assignValidationErrors({fullName: ["some error"]});

        expect(invalidCallback).to(haveBeenCalled, withArgs(record));

        record.clearValidationErrors();
        expect(validCallback).to(haveBeenCalled, withArgs(record));
      });
    });

    describe("#pauseEvents and #resumeEvents", function() {
      specify("#pauseEvents delays #onInsert, #onRemove, and #onUpdate triggers until #resumeEvents is called. Then delayed events are flushed and future events are no longer delayed", function() {
        var insertCallback = mockFunction("insert callback");
        var updateCallback = mockFunction("update callback");
        var removeCallback = mockFunction("remove callback");

        User.table.onInsert(insertCallback);
        User.table.onUpdate(updateCallback);
        User.table.onRemove(removeCallback);

        User.table.pauseEvents();

        var record = User.createFromRemote({id: "jake", fullName: "Jake Frautschi"});
        record.remotelyUpdated({ fullName: "Jacob Frautschi" });
        record.remotelyDestroyed();

        expect(insertCallback).toNot(haveBeenCalled);
        expect(updateCallback).toNot(haveBeenCalled);
        expect(removeCallback).toNot(haveBeenCalled);

        User.table.resumeEvents();

        expect(insertCallback).to(haveBeenCalled, withArgs(record));
        expect(updateCallback).to(haveBeenCalled, once);
        expect(updateCallback).to(haveBeenCalled, withArgs(record, {
          fullName: {
            column: User.fullName,
            oldValue: "Jake Frautschi",
            newValue: "Jacob Frautschi"
          }
        }));
        expect(removeCallback).to(haveBeenCalled, withArgs(record));

        insertCallback.clear();
        updateCallback.clear();
        removeCallback.clear();

        var record2 = User.createFromRemote({id: "nathan", fullName: "Nathan Sobo"});

        expect(insertCallback).to(haveBeenCalled, once);
        expect(insertCallback).to(haveBeenCalled, withArgs(record2));

        record2.remote.update({fullName: "Nate Sobo"});
        expect(updateCallback).to(haveBeenCalled, once);

        record2.remotelyDestroyed();
        expect(removeCallback).to(haveBeenCalled, once);
      });
    });

    describe("#evaluateInRepository(repository)", function() {
      it("returns the equivalent Table from the given repository", function() {
        var otherRepo = Repository.cloneSchema();
        var tableInOtherRepo = User.table.evaluateInRepository(otherRepo);
        expect(tableInOtherRepo).to(eq, otherRepo.tables.users);
      });
    });
  });
}});
