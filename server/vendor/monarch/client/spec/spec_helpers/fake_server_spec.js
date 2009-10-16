//= require "../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("FakeServer", function() {
//    use_local_fixtures();
    use_example_domain_model();

    var fake_server;
    before(function() {
      fake_server = new FakeServer();
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
      it("adds the a FakeFetch to a #fetches array, then executes the fetch against its fixture repository and triggers the returned future when #simulate_success is called on it", function() {
        var before_events_callback = mock_function("before delta events callback", function() {
          expect(User.find("sharon")).to_not(be_null);
          expect(insert_callback).to_not(have_been_called);
        });
        var insert_callback = mock_function("on insert callback");
        var after_events_callback = mock_function("after delta events callback", function() {
          expect(User.find("sharon")).to_not(be_null);
          expect(insert_callback).to(have_been_called, twice);
        });

        User.on_insert(insert_callback);


        expect(fake_server.fetches).to(be_empty);
        expect(User.find('sharon')).to(be_null);
        expect(Blog.find('guns')).to(be_null);

        Repository.origin_url = "/users/bob/sandbox"
        var future = fake_server.fetch([Blog.table, User.table]);

        future.before_events(before_events_callback);
        future.after_events(after_events_callback);

        expect(fake_server.fetches).to(have_length, 1);
        expect(User.find('sharon')).to(be_null);
        expect(Blog.find('guns')).to(be_null);

        fake_server.fetches.shift().simulate_success();

        expect(before_events_callback).to(have_been_called);
        expect(insert_callback).to(have_been_called);
        expect(after_events_callback).to(have_been_called);

        expect(User.find('sharon').full_name()).to(equal, 'Sharon Ly');
        expect(Blog.find('guns').user_id()).to(equal, 'sharon');
      });
    });

    describe("#simulate_fetch", function() {
      it("immediately fetches records from the FakeServer's repository to the local repository", function() {
        expect(Blog.records()).to(be_empty);
        fake_server.simulate_fetch([Blog.table]);
        expect(Blog.records()).to_not(be_empty);
      });
    });
  });
}});
