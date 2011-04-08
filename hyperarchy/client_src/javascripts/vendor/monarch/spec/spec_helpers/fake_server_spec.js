//= require "../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("FakeServer", function() {
    useExampleDomainModel();

    var fakeServer;
    before(function() {
      Repository.sandboxUrl = "/users/bob/sandbox"
      fakeServer = new FakeServer(false);
      fakeServer.Repository.loadFixtures({
        users: {
          sharon: {
            fullName: "Sharon Ly"
          },
          stephanie: {
            fullName: "Stephanie Wambach"
          }
        },
        blogs: {
          guns: {
            name: "Guns, Ammo, and Me",
            userId: "sharon"
          },
          aircraft: {
            name: "My Favorite Aircraft",
            userId: "stephanie"
          }
        }
      });
    });

    describe("#fetch", function() {
      it("adds a FakeFetch to a #fetches array, then executes the fetch against its fixture repository and triggers the returned future when #simulateSuccess is called on it", function() {
        var beforeEventsCallback = mockFunction("before delta events callback", function() {
          expect(User.find("sharon")).toNot(beNull);
          expect(insertCallback).toNot(haveBeenCalled);
        });
        var insertCallback = mockFunction("on insert callback");
        var afterEventsCallback = mockFunction("after delta events callback", function() {
          expect(User.find("sharon")).toNot(beNull);
          expect(insertCallback).to(haveBeenCalled, twice);
        });

        User.onInsert(insertCallback);

        expect(fakeServer.fetches).to(beEmpty);
        expect(User.find('sharon')).to(beNull);
        expect(Blog.find('guns')).to(beNull);

        var future = fakeServer.fetch([Blog.table, User.table]);

        future.beforeEvents(beforeEventsCallback);
        future.afterEvents(afterEventsCallback);

        expect(fakeServer.fetches).to(haveLength, 1);
        expect(User.find('sharon')).to(beNull);
        expect(Blog.find('guns')).to(beNull);

        fakeServer.lastFetch.simulateSuccess();
        expect(fakeServer.fetches).to(beEmpty);

        expect(beforeEventsCallback).to(haveBeenCalled);
        expect(insertCallback).to(haveBeenCalled);
        expect(afterEventsCallback).to(haveBeenCalled);

        expect(User.find('sharon').fullName()).to(eq, 'Sharon Ly');
        expect(Blog.find('guns').userId()).to(eq, 'sharon');
      });
    });

    describe("#create", function() {
      it("adds a request to the Server.creates array and assigns Server.lastCreate, which will perform the create when success is simulated", function() {
        var insertCallback = mockFunction('insertCallback');
        var successCallback = mockFunction('successCallback');

        User.onInsert(insertCallback);

        var record = User.build({fullName: "John Doe", age: 34});
        fakeServer.create(record).onSuccess(successCallback);

        expect(record.isRemotelyCreated).to(beFalse);
        expect(fakeServer.creates.length).to(eq, 1);
        expect(fakeServer.lastCreate).to(eq, fakeServer.creates[0]);


        fakeServer.lastCreate.simulateSuccess();

        expect(fakeServer.lastCreate).to(beNull);
        expect(fakeServer.creates).to(beEmpty);

        expect(record.isRemotelyCreated).to(beTrue);
        expect(record.id()).toNot(beNull);

        expect(insertCallback).to(haveBeenCalled);
        expect(insertCallback.mostRecentArgs[0]).to(eq, record);
        expect(successCallback).to(haveBeenCalled, withArgs(record));
      });
    });

    describe("#update", function() {
      it("adds a request to the Server.updates array and assigns Server.lastUpdate, which will perform the update when success is simulated", function() {
        var updateCallback = mockFunction('updateCallback');
        var successCallback = mockFunction('successCallback');

        User.onUpdate(updateCallback);

        var record = User.createFromRemote({id: 1, fullName: "John Doe", age: 34});
        record.localUpdate({
          fullName: "John Deere",
          age: 56
        });

        fakeServer.update(record).onSuccess(successCallback);

        expect(record.dirty()).to(beTrue);
        expect(fakeServer.updates.length).to(eq, 1);
        expect(fakeServer.lastUpdate).to(eq, fakeServer.updates[0]);


        fakeServer.lastUpdate.simulateSuccess();

        expect(fakeServer.lastUpdate).to(beNull);
        expect(fakeServer.updates).to(beEmpty);

        expect(record.dirty()).to(beFalse);
        expect(record.fullName()).to(eq, "John Deere");
        expect(record.age()).to(eq, 56);

        var expectedChangeset = {
          fullName: {
            column: User.fullName,
            oldValue: "John Doe",
            newValue: "John Deere"
          },
          age: {
            column: User.age,
            oldValue: 34,
            newValue: 56
          }
        };

        expect(updateCallback).to(haveBeenCalled);
        expect(updateCallback.mostRecentArgs[0]).to(eq, record);
        expect(updateCallback.mostRecentArgs[1]).to(equal, expectedChangeset);
        expect(successCallback).to(haveBeenCalled, withArgs(record, expectedChangeset));
      });
    });

    describe("#destroy", function() {
      it("adds a request to the Server.destroys array and assigns Server.lastDestroy, which will perform the destroy when success is simulated", function() {
        var removeCallback = mockFunction('removeCallback');
        var successCallback = mockFunction('successCallback');

        User.onRemove(removeCallback);

        var record = User.createFromRemote({id: 1, fullName: "John Doe", age: 34});
        fakeServer.destroy(record).onSuccess(successCallback);
        
        expect(User.find(1)).toNot(beNull);
        expect(fakeServer.destroys.length).to(eq, 1);
        expect(fakeServer.lastDestroy).to(eq, fakeServer.destroys[0]);

        fakeServer.lastDestroy.simulateSuccess();

        expect(fakeServer.lastDestroy).to(beNull);
        expect(fakeServer.destroys).to(beEmpty);

        expect(User.find(1)).to(beNull);

        expect(removeCallback).to(haveBeenCalled);
        expect(removeCallback.mostRecentArgs[0]).to(eq, record);
        expect(successCallback).to(haveBeenCalled, withArgs(record));
      });
    });

    describe("#autoFetch", function() {
      it("immediately fetches tuples from the FakeServer's repository to the local repository", function() {
        expect(Blog.tuples()).to(beEmpty);
        fakeServer.autoFetch([Blog.table]);
        expect(Blog.tuples()).toNot(beEmpty);
      });
    });

    describe("#get, #put, #post, and #delete", function() {
      they("add fake requests to the fake server, which fire future callbacks and removes themselves when their success is simulated", function() {
        var successCallback = mockFunction('successCallback');
        var failureCallback = mockFunction('failureCallback');

        fakeServer.get('/foo', {foo: 'bar'})
          .onFailure(failureCallback);
        fakeServer.get('/bang', {glorp: 'buzz'})
          .onSuccess(successCallback);


        expect(fakeServer.gets.length).to(eq, 2);
        expect(fakeServer.lastGet).to(eq, fakeServer.gets[1]);
        expect(fakeServer.lastGet.url).to(eq, '/bang');
        expect(fakeServer.lastGet.data).to(equal, {glorp: 'buzz'});

        fakeServer.lastGet.simulateSuccess({baz: 'quux'});
        expect(successCallback).to(haveBeenCalled, withArgs({baz: 'quux'}));

        expect(fakeServer.gets.length).to(eq, 1);
        expect(fakeServer.lastGet).to(eq, fakeServer.gets[0]);
        expect(fakeServer.lastGet.url).to(eq, '/foo');
        expect(fakeServer.lastGet.data).to(equal, {foo: 'bar'});

        fakeServer.lastGet.simulateFailure({bar: 'foo'});
        expect(failureCallback).to(haveBeenCalled, withArgs({bar: 'foo'}));

        expect(fakeServer.gets).to(beEmpty);
        expect(fakeServer.lastGet).to(beNull);
      });
    });
  });
}});



























