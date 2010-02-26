//= require "../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("FakeServer", function() {
    use_example_domain_model();

    var fake_server;
    before(function() {
      Repository.origin_url = "/users/bob/sandbox"
      fake_server = new FakeServer(false);

      fake_server.Repository.tables.users.on_fake_repo = true;
      fake_server.Repository.tables.blogs.on_fake_repo = true;
      fake_server.Repository.tables.blog_posts.on_fake_repo = true;

      fake_server.Repository.load_fixtures({
        users: {
          sharon: {
            full_name: "Sharon Ly"
          },
          stephanie: {
            full_name: "Stephanie Wambach"
          }
        },
        blogs: {
          guns: {
            name: "Guns, Ammo, and Me",
            user_id: "sharon"
          },
          aircraft: {
            name: "My Favorite Aircraft",
            user_id: "stephanie"
          }
        }
      });
    });

    describe("#fetch", function() {
      it("adds a FakeFetch to a #fetches array, then executes the fetch against its fixture repository and triggers the returned future when #simulate_success is called on it", function() {
        var before_events_callback = mock_function("before delta events callback", function() {
          expect(User.find("sharon")).to_not(be_null);
          expect(insert_callback).to_not(have_been_called);
        });
        var insert_callback = mock_function("on insert callback");
        var after_events_callback = mock_function("after delta events callback", function() {
          expect(User.find("sharon")).to_not(be_null);
          expect(insert_callback).to(have_been_called, twice);
        });

        User.on_remote_insert(insert_callback);

        expect(fake_server.fetches).to(be_empty);
        expect(User.find('sharon')).to(be_null);
        expect(Blog.find('guns')).to(be_null);

        var future = fake_server.fetch([Blog.table, User.table]);

        future.before_events(before_events_callback);
        future.after_events(after_events_callback);

        expect(fake_server.fetches).to(have_length, 1);
        expect(User.find('sharon')).to(be_null);
        expect(Blog.find('guns')).to(be_null);

        fake_server.last_fetch.simulate_success();
        expect(fake_server.fetches).to(be_empty);

        expect(before_events_callback).to(have_been_called);
        expect(insert_callback).to(have_been_called);
        expect(after_events_callback).to(have_been_called);

        expect(User.find('sharon').full_name()).to(equal, 'Sharon Ly');
        expect(Blog.find('guns').user_id()).to(equal, 'sharon');
      });
    });

    describe("#auto_fetch", function() {
      it("immediately fetches tuples from the FakeServer's repository to the local repository", function() {
        expect(Blog.tuples()).to(be_empty);
        fake_server.auto_fetch([Blog.table]);
        expect(Blog.tuples()).to_not(be_empty);
      });
    });

    describe("#subscribe", function() {
      it("adds a FakeSubscribe to the #subscribes array and triggers the returned future with synthetic subscription ids when #simulate_success is called on it", function() {
        expect(fake_server.subscribes).to(be_empty);

        var future = fake_server.subscribe([Blog.table, User.table]);

        expect(fake_server.subscribes).to(have_length, 1);
        expect(fake_server.last_subscribe).to(equal, fake_server.subscribes[0]);
        expect(fake_server.last_subscribe.relations).to(equal, [Blog.table, User.table]);


        var success_callback = mock_function('success_callback');
        future.on_success(success_callback);

        fake_server.last_subscribe.simulate_success();

        expect(fake_server.subscribes.length).to(equal, 0);
        expect(fake_server.last_subscribe).to(be_null);

        expect(success_callback).to(have_been_called, once);
        expect(success_callback.most_recent_args[0][0].id).to_not(be_null);
        expect(success_callback.most_recent_args[0][0].relation).to(equal, Blog.table);
        expect(success_callback.most_recent_args[0][1].id).to_not(equal, success_callback.most_recent_args[0].id);
        expect(success_callback.most_recent_args[0][1].relation).to(equal, User.table);
      });
    });

    describe("#unsubscribe", function() {
      it("adds a FakeUnsubscribe to the #unsubscribes array and triggers the returned future when #simulate_success is called on it", function() {
        expect(fake_server.unsubscribes).to(be_empty);
        
        var remote_subscription_1 = new Monarch.Http.RemoteSubscription("1", Blog.table);
        var remote_subscription_2 = new Monarch.Http.RemoteSubscription("2", User.table);

        var future = fake_server.unsubscribe([remote_subscription_1, remote_subscription_2]);

        expect(fake_server.unsubscribes).to(have_length, 1);
        expect(fake_server.last_unsubscribe).to(equal, fake_server.unsubscribes[0]);
        expect(fake_server.last_unsubscribe.remote_subscriptions).to(equal, [remote_subscription_1, remote_subscription_2]);

        var success_callback = mock_function('success_callback');
        future.on_success(success_callback);

        fake_server.last_unsubscribe.simulate_success();

        expect(fake_server.unsubscribes.length).to(equal, 0);
        expect(fake_server.last_unsubscribe).to(be_null);
        expect(success_callback).to(have_been_called, once);
      });
    });

    describe("#get, #put, #post, and #delete_", function() {
      they("add fake requests to the fake server, which fire future callbacks and removes themselves when their success is simulated", function() {
        var success_callback = mock_function('success_callback');
        var failure_callback = mock_function('failure_callback');

        fake_server.get('/foo', {foo: 'bar'})
          .on_failure(failure_callback);
        fake_server.get('/bang', {glorp: 'buzz'})
          .on_success(success_callback);


        expect(fake_server.gets.length).to(equal, 2);
        expect(fake_server.last_get).to(equal, fake_server.gets[1]);
        expect(fake_server.last_get.url).to(equal, '/bang');
        expect(fake_server.last_get.data).to(equal, {glorp: 'buzz'});

        fake_server.last_get.simulate_success({baz: 'quux'});
        expect(success_callback).to(have_been_called, with_args({baz: 'quux'}));

        expect(fake_server.gets.length).to(equal, 1);
        expect(fake_server.last_get).to(equal, fake_server.gets[0]);
        expect(fake_server.last_get.url).to(equal, '/foo');
        expect(fake_server.last_get.data).to(equal, {foo: 'bar'});

        fake_server.last_get.simulate_failure({bar: 'foo'});
        expect(failure_callback).to(have_been_called, with_args({bar: 'foo'}));

        expect(fake_server.gets).to(be_empty);
        expect(fake_server.last_get).to(be_null);
      });
    });
  });
}});



























