//= require "../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("FakeServer", function() {
    useExampleDomainModel();

    var fakeServer;
    before(function() {
      Repository.originUrl = "/users/bob/sandbox"
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

        User.onRemoteInsert(insertCallback);

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

    describe("#autoFetch", function() {
      it("immediately fetches tuples from the FakeServer's repository to the local repository", function() {
        expect(Blog.tuples()).to(beEmpty);
        fakeServer.autoFetch([Blog.table]);
        expect(Blog.tuples()).toNot(beEmpty);
      });
    });

    describe("#subscribe", function() {
      it("adds a FakeSubscribe to the #subscribes array and triggers the returned future with synthetic subscription ids when #simulateSuccess is called on it", function() {
        expect(fakeServer.subscribes).to(beEmpty);

        var future = fakeServer.subscribe([Blog.table, User.table]);

        expect(fakeServer.subscribes).to(haveLength, 1);
        expect(fakeServer.lastSubscribe).to(eq, fakeServer.subscribes[0]);
        expect(fakeServer.lastSubscribe.relations).to(equal, [Blog.table, User.table]);


        var successCallback = mockFunction('successCallback');
        future.onSuccess(successCallback);

        fakeServer.lastSubscribe.simulateSuccess();

        expect(fakeServer.subscribes.length).to(eq, 0);
        expect(fakeServer.lastSubscribe).to(beNull);

        expect(successCallback).to(haveBeenCalled, once);
        expect(successCallback.mostRecentArgs[0][0].id).toNot(beNull);
        expect(successCallback.mostRecentArgs[0][0].relation).to(eq, Blog.table);
        expect(successCallback.mostRecentArgs[0][1].id).toNot(equal, successCallback.mostRecentArgs[0].id);
        expect(successCallback.mostRecentArgs[0][1].relation).to(eq, User.table);
      });
    });

    describe("#unsubscribe", function() {
      it("adds a FakeUnsubscribe to the #unsubscribes array and triggers the returned future when #simulateSuccess is called on it", function() {
        expect(fakeServer.unsubscribes).to(beEmpty);
        
        var remoteSubscription1 = new Monarch.Http.RemoteSubscription("1", Blog.table);
        var remoteSubscription2 = new Monarch.Http.RemoteSubscription("2", User.table);

        var future = fakeServer.unsubscribe([remoteSubscription1, remoteSubscription2]);

        expect(fakeServer.unsubscribes).to(haveLength, 1);
        expect(fakeServer.lastUnsubscribe).to(eq, fakeServer.unsubscribes[0]);
        expect(fakeServer.lastUnsubscribe.remoteSubscriptions).to(equal, [remoteSubscription1, remoteSubscription2]);

        var successCallback = mockFunction('successCallback');
        future.onSuccess(successCallback);

        fakeServer.lastUnsubscribe.simulateSuccess();

        expect(fakeServer.unsubscribes.length).to(eq, 0);
        expect(fakeServer.lastUnsubscribe).to(beNull);
        expect(successCallback).to(haveBeenCalled, once);
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



























