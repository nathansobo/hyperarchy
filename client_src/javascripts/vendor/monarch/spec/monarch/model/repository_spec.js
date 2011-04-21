//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Repository", function() {
    useLocalFixtures();

    var repository;
    before(function() {
      repository = Repository;
    });

    describe("#pauseEvents", function() {
      it("calls .pauseEvents on all Tables", function() {
        mock(Blog.table, 'pauseEvents');
        mock(User.table, 'pauseEvents');

        repository.pauseEvents();

        expect(Blog.table.pauseEvents).to(haveBeenCalled, once);
        expect(User.table.pauseEvents).to(haveBeenCalled, once);
      });
    });

    describe("#resumeEvents", function() {
      it("calls .resumeEvents on all Tables", function() {
        repository.pauseEvents();

        mock(Blog.table, 'resumeEvents');
        mock(User.table, 'resumeEvents');

        repository.resumeEvents();

        expect(Blog.table.resumeEvents).to(haveBeenCalled, once);
        expect(User.table.resumeEvents).to(haveBeenCalled, once);
      });
    });

    describe("#pauseMutations and #resumeMutations", function() {
      they("enqueue mutations while they are paused and executes enqueued mutations plus any further mutations after resuming", function() {
        repository.pauseMutations();
        // should only resume after all calls to pauseMutations are matched with a call to resumeMutations
        repository.pauseMutations();

        repository.mutate([
          ['create', 'blog_posts', { id: 'running', name: "It Keeps You Running" }],
          ['update', 'blogs', 'recipes', { name: "Absolutely Disgusting Food"}]
        ]);

        expect(BlogPost.find('running')).to(beNull);
        expect(Blog.find('recipes').name()).toNot(equal, "Absolutely Disgusting Food");

        repository.mutate([['destroy', 'users', 'jan']]);

        expect(User.find('jan')).toNot(beNull);

        repository.resumeMutations(); // 2 outstanding pauses, should not yet resume

        expect(BlogPost.find('running')).to(beNull);
        expect(Blog.find('recipes').name()).toNot(equal, "Absolutely Disgusting Food");
        expect(User.find('jan')).toNot(beNull);

        repository.resumeMutations(); // now 1 outstanding pause, should resume

        expect(BlogPost.find('running')).toNot(beNull);
        expect(Blog.find('recipes').name()).to(eq, "Absolutely Disgusting Food");
        expect(User.find('jan')).to(beNull);

        repository.mutate([['update', 'blogs', 'recipes', { name: "Chicken Aint So Bad" }]]);
        
        expect(Blog.find('recipes').name()).to(eq, "Chicken Aint So Bad");
      });
    });

    describe("#update", function() {
      it("inserts tuples that don't exist and updates those that do", function() {
        expect(User.find('nathan')).to(beNull);
        expect(Blog.find('metacircular')).to(beNull);
        expect(Blog.find('travel')).to(beNull);

        var jan = User.fixture('jan');
        expect(jan.fullName()).to(eq, 'Jan Nelson');

        repository.update({
          users: {
            nathan: {
              id: 'nathan',
              fullName: 'Nathan Sobo',
              bogusColumn: 'Should not cause exception'
            },
            jan: {
              id: 'jan',
              fullName: 'Jan Christian Nelson'
            }
          },
          blogs: {
            metacircular: {
              id: 'metacircular',
              userId: 'nathan',
              name: 'Metacircular'
            },
            travel: {
              id: 'travel',
              userId: 'nathan',
              name: "Nathan's Travels"
            }
          }
        });

        var nathan = User.fixture('nathan');
        var metacircular = Blog.fixture('metacircular');
        var travel = Blog.fixture('travel');

        expect(nathan.fullName()).to(eq, 'Nathan Sobo');
        expect(metacircular.name()).to(eq, 'Metacircular');
        expect(metacircular.userId()).to(eq, 'nathan');
        expect(travel.name()).to(eq, "Nathan's Travels");
        expect(travel.userId()).to(eq, 'nathan');
        expect(jan.fullName()).to(eq, 'Jan Christian Nelson');
      });
    });

    describe("#delta", function() {
      it("inserts tuples that don't exist, updates those that do, and removes tuples that are not present in the given snapshot", function() {
        expect(User.find('nathan')).to(beNull);
        expect(Blog.find('metacircular')).to(beNull);
        expect(Blog.find('travel')).to(beNull);

        var jan = User.fixture('jan');
        expect(jan.fullName()).to(eq, 'Jan Nelson');
        expect(User.find('mike')).toNot(beNull);
        expect(User.find('wil')).toNot(beNull);
        expect(Blog.find('recipes')).toNot(beNull);
        expect(Blog.find('motorcycle')).toNot(beNull);

        repository.delta({
          users: {
            nathan: {
              id: 'nathan',
              fullName: 'Nathan Sobo'
            },
            jan: {
              id: 'jan',
              fullName: 'Jan Christian Nelson'
            }
          },
          blogs: {
            metacircular: {
              id: 'metacircular',
              userId: 'nathan',
              name: 'Metacircular'
            },
            travel: {
              id: 'travel',
              userId: 'nathan',
              name: "Nathan's Travels"
            }
          }
        });

        var nathan = User.fixture('nathan');
        var metacircular = Blog.fixture('metacircular');
        var travel = Blog.fixture('travel');

        expect(User.find('mike')).to(beNull);
        expect(User.find('wil')).to(beNull);
        expect(Blog.find('recipes')).to(beNull);
        expect(Blog.find('motorcycle')).to(beNull);
        expect(nathan.fullName()).to(eq, 'Nathan Sobo');
        expect(metacircular.name()).to(eq, 'Metacircular');
        expect(metacircular.userId()).to(eq, 'nathan');
        expect(travel.name()).to(eq, "Nathan's Travels");
        expect(travel.userId()).to(eq, 'nathan');
        expect(jan.fullName()).to(eq, 'Jan Christian Nelson');
      });
    });

    describe("#mutate", function() {
      it("takes an array of mutation commands, and executes them if their effects are not redundant", function() {
        var insertCallback = mockFunction('insertCallback');
        var updateCallback = mockFunction('updateCallback');
        var removeCallback = mockFunction('removeCallback');

        Blog.onInsert(insertCallback);
        User.onUpdate(updateCallback);
        User.onRemove(removeCallback);

        repository.mutate([
          ['create', 'blogs', { id: "malathion", name: "Recipes From The Makers of Malathion"}],
          ['create', 'blogs', { id: "malathion", name: "Recipes From The Makers of Malathion"}],
          ['update', 'users', 'jan', { age: 88 }],
          ['update', 'users', 'jan', { age: 88 }],
          ['destroy', 'users', 'wil'],
          ['destroy', 'users', 'wil']
        ]);

        expect(insertCallback).to(haveBeenCalled, once);
        expect(updateCallback).to(haveBeenCalled, once);
        expect(removeCallback).to(haveBeenCalled, once);

        expect(Blog.find('malathion').name()).to(eq, "Recipes From The Makers of Malathion");
        expect(User.find('jan').age()).to(eq, 88);
        expect(User.find('wil')).to(beNull);
      });
    });

    describe("#clear", function() {
      it("removes all data from all tables", function() {
        expect(Blog.tuples()).toNot(beEmpty);
        expect(User.tuples()).toNot(beEmpty);
        repository.clear();
        expect(User.tuples()).to(beEmpty);
        expect(Blog.tuples()).to(beEmpty);
      });

      it("removes all pending mutations and takes the repository out of a paused state", function() {
        repository.pauseMutations();
        repository.mutate([
          ['create', 'blog_posts', { id: 'running', name: "It Keeps You Running" }],
          ['update', 'blogs', 'recipes', { name: "Absolutely Disgusting Food"}]
        ]);
        repository.clear();
        expect(repository.enqueuedMutations).to(beNull);
        expect(repository.mutationsPaused).to(beFalse);
        expect(repository.mutationsPausedCount).to(eq, 0);
      });
    });

    describe("#cloneSchema", function() {
      it("makes another Repository with the cloned schemas of all its Tables", function() {
        expect(repository.tables.users).toNot(beNull);
        expect(repository.tables.users.tuples()).toNot(beEmpty);
        expect(repository.tables.blogs).toNot(beNull);
        expect(repository.tables.blogs.tuples()).toNot(beEmpty);

        var clone = repository.cloneSchema();

        // same tables
        expect(clone.tables.users).toNot(beNull);
        expect(clone.tables.users.tuples()).to(beEmpty);
        expect(clone.tables.blogs).toNot(beNull);
        expect(clone.tables.blogs.tuples()).to(beEmpty);

        // with same columns (schema)
        expect(clone.tables.users.columnsByName).to(eq, repository.tables.users.columnsByName);
        expect(clone.tables.users.column('fullName')).to(eq, repository.tables.users.column('fullName'));

        // but different data stores
        var numUsersInOriginalRepository = repository.tables.users.tuples().length;
        clone.tables.users.createFromRemote({fullName: "Wil Bierbaum"});
        expect(repository.tables.users.tuples().length).to(eq, numUsersInOriginalRepository);
      });
    });
  });
}});
