//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Repository", function() {
    use_local_fixtures();

    var repository;
    before(function() {
      repository = Repository;
    });

    describe("#pause_events", function() {
      it("calls .pause_events on all Tables", function() {
        mock(Blog.table, 'pause_events');
        mock(User.table, 'pause_events');

        repository.pause_events();

        expect(Blog.table.pause_events).to(have_been_called, once);
        expect(User.table.pause_events).to(have_been_called, once);
      });
    });

    describe("#resume_events", function() {
      it("calls .resume_events on all Tables", function() {
        repository.pause_events();

        mock(Blog.table, 'resume_events');
        mock(User.table, 'resume_events');

        repository.resume_events();

        expect(Blog.table.resume_events).to(have_been_called, once);
        expect(User.table.resume_events).to(have_been_called, once);
      });
    });

    describe("#update", function() {
      it("inserts tuples that don't exist and updates those that do", function() {
        expect(User.find('nathan')).to(be_null);
        expect(Blog.find('metacircular')).to(be_null);
        expect(Blog.find('travel')).to(be_null);

        var jan = User.find('jan');
        expect(jan.full_name()).to(equal, 'Jan Nelson');

        repository.update({
          users: {
            nathan: {
              id: 'nathan',
              full_name: 'Nathan Sobo',
              bogus_column: 'Should not cause exception'
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

    describe("#delta", function() {
      it("inserts tuples that don't exist, updates those that do, and removes tuples that are not present in the given snapshot", function() {
        expect(User.find('nathan')).to(be_null);
        expect(Blog.find('metacircular')).to(be_null);
        expect(Blog.find('travel')).to(be_null);

        var jan = User.find('jan');
        expect(jan.full_name()).to(equal, 'Jan Nelson');
        expect(User.find('mike')).to_not(be_null);
        expect(User.find('wil')).to_not(be_null);
        expect(Blog.find('recipes')).to_not(be_null);
        expect(Blog.find('motorcycle')).to_not(be_null);

        repository.delta({
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

        expect(User.find('mike')).to(be_null);
        expect(User.find('wil')).to(be_null);
        expect(Blog.find('recipes')).to(be_null);
        expect(Blog.find('motorcycle')).to(be_null);
        expect(nathan.full_name()).to(equal, 'Nathan Sobo');
        expect(metacircular.name()).to(equal, 'Metacircular');
        expect(metacircular.user_id()).to(equal, 'nathan');
        expect(travel.name()).to(equal, "Nathan's Travels");
        expect(travel.user_id()).to(equal, 'nathan');
        expect(jan.full_name()).to(equal, 'Jan Christian Nelson');
      });
    });

    describe("#mutate", function() {
      it("takes an array of mutation commands, and executes them if their effects are not redundant", function() {
        var insert_callback = mock_function('insert_callback');
        var update_callback = mock_function('update_callback');
        var remove_callback = mock_function('remove_callback');

        Blog.on_insert(insert_callback);
        User.on_update(update_callback);
        User.on_remove(remove_callback);

        repository.mutate([
          ['create', 'blogs', { id: "malathion", name: "Recipes From The Makers of Malathion"}],
          ['create', 'blogs', { id: "malathion", name: "Recipes From The Makers of Malathion"}],
          ['update', 'users', 'jan', { age: 88 }],
          ['update', 'users', 'jan', { age: 88 }],
          ['destroy', 'users', 'wil'],
          ['destroy', 'users', 'wil']
        ]);

        expect(insert_callback).to(have_been_called, once);
        expect(update_callback).to(have_been_called, once);
        expect(remove_callback).to(have_been_called, once);

        expect(Blog.find('malathion').name()).to(equal, "Recipes From The Makers of Malathion");
        expect(User.find('jan').age()).to(equal, 88);
        expect(User.find('wil')).to(be_null);
      });
    });

    describe("#clear", function() {
      it("removes all data from all tables", function() {
        expect(Blog.tuples()).to_not(be_empty);
        expect(User.tuples()).to_not(be_empty);
        repository.clear();
        expect(User.tuples()).to(be_empty);
        expect(Blog.tuples()).to(be_empty);
      });
    });

    describe("#clone_schema", function() {
      it("makes another Repository with the cloned schemas of all its Tables", function() {
        expect(repository.tables.users).to_not(be_null);
        expect(repository.tables.users.tuples()).to_not(be_empty);
        expect(repository.tables.blogs).to_not(be_null);
        expect(repository.tables.blogs.tuples()).to_not(be_empty);

        var clone = repository.clone_schema();

        // same tables
        expect(clone.tables.users).to_not(be_null);
        expect(clone.tables.users.tuples()).to(be_empty);
        expect(clone.tables.blogs).to_not(be_null);
        expect(clone.tables.blogs.tuples()).to(be_empty);

        // with same columns (schema)
        expect(clone.tables.users.columns_by_name).to(equal, repository.tables.users.columns_by_name);
        expect(clone.tables.users.column('full_name')).to(equal, repository.tables.users.column('full_name'));

        // but different data stores
        var num_users_in_original_repository = repository.tables.users.tuples().length;
        clone.tables.users.insert(new User({full_name: "Wil Bierbaum"}));
        expect(repository.tables.users.tuples().length).to(equal, num_users_in_original_repository);
      });
    });
  });
}});
