//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Model.Repository", function() {
    use_local_fixtures();

    var repository;
    before(function() {
      repository = Repository;
    });

    describe("#remote_create(relation, field_values)", function() {
      use_fake_server();

      it("calls Server.post with #origin_url and json to create a Record with the given field values in the given Relation", function() {
        repository.origin_url = "/users/steph/repository";
        var future = repository.remote_create(Blog.table, {name: 'Recipes'});
        expect(Origin.posts).to(have_length, 1);

        var post = Origin.posts.shift();
        expect(post.url).to(equal, repository.origin_url);
        expect(post.data).to(equal, {
          relation: Blog.table.wire_representation(),
          field_values: {name: 'Recipes'}
        });

        mock(future, 'handle_response');
        post.simulate_success({id: 'recipes', name: 'Recipes'});
      });
    });

    describe("#pause_delta_events", function() {
      it("calls .pause_delta_events on all Tables", function() {
        mock(Blog.table, 'pause_delta_events');
        mock(User.table, 'pause_delta_events');

        repository.pause_delta_events();

        expect(Blog.table.pause_delta_events).to(have_been_called, once);
        expect(User.table.pause_delta_events).to(have_been_called, once);
      });
    });

    describe("#resume_delta_events", function() {
      it("calls .resume_delta_events on all Tables", function() {
        mock(Blog.table, 'resume_delta_events');
        mock(User.table, 'resume_delta_events');

        repository.resume_delta_events();

        expect(Blog.table.resume_delta_events).to(have_been_called, once);
        expect(User.table.resume_delta_events).to(have_been_called, once);
      });
    });

    describe("#update", function() {
      it("inserts records that don't exist and updates those that do", function() {
        expect(User.find('nathan')).to(be_null);
        expect(Blog.find('metacircular')).to(be_null);
        expect(Blog.find('travel')).to(be_null);

        var jan = User.find('jan');
        expect(jan.full_name()).to(equal, 'Jan Nelson');

        repository.update({
          users: {
            nathan: {
              id: 'nathan',
              full_name: 'Nathan Sobo'
            },
            jan: {
              id: 'jan',
              full_name: 'Jan Christian Nelson'
            }
          },
          blogs: {
            metacircular: {
              id: 'metacircular',
              user_id: 'nathan',
              name: 'Metacircular'
            },
            travel: {
              id: 'travel',
              user_id: 'nathan',
              name: "Nathan's Travels"
            }
          }
        });

        var nathan = User.find('nathan');
        var metacircular = Blog.find('metacircular');
        var travel = Blog.find('travel');

        expect(nathan.full_name()).to(equal, 'Nathan Sobo');
        expect(metacircular.name()).to(equal, 'Metacircular');
        expect(metacircular.user_id()).to(equal, 'nathan');
        expect(travel.name()).to(equal, "Nathan's Travels");
        expect(travel.user_id()).to(equal, 'nathan');
        expect(jan.full_name()).to(equal, 'Jan Christian Nelson');
      });
    });

    describe("#clear", function() {
      it("removes all data from all tables", function() {
        expect(Blog.all()).to_not(be_empty);
        expect(User.all()).to_not(be_empty);
        repository.clear();
        expect(User.all()).to(be_empty);
        expect(Blog.all()).to(be_empty);
      });
    });

    describe("#clone_schema", function() {
      it("makes another Repository with the cloned schemas of all its Tables", function() {
        expect(repository.tables.users).to_not(be_null);
        expect(repository.tables.users.all()).to_not(be_empty);
        expect(repository.tables.blogs).to_not(be_null);
        expect(repository.tables.blogs.all()).to_not(be_empty);

        var clone = repository.clone_schema();

        // same tables
        expect(clone.tables.users).to_not(be_null);
        expect(clone.tables.users.all()).to(be_empty);
        expect(clone.tables.blogs).to_not(be_null);
        expect(clone.tables.blogs.all()).to(be_empty);

        // with same columns (schema)
        expect(clone.tables.users.columns_by_name).to(equal, repository.tables.users.columns_by_name);
        expect(clone.tables.users.column('full_name')).to(equal, repository.tables.users.column('full_name'));

        // but different data stores
        var num_users_in_original_repository = repository.tables.users.all().length;
        clone.tables.users.insert(new User({full_name: "Wil Bierbaum"}));
        expect(repository.tables.users.all().length).to(equal, num_users_in_original_repository);
      });
    });
  });
}});
