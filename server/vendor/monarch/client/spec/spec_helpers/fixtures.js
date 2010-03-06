Screw.Unit(function(c) {
  c.useLocalFixtures = function() {
    c.useExampleDomainModel(function() {
      c.init(function() {
        Repository.loadFixtures({
          users: {
            jan: {
              fullName: 'Jan Nelson',
              age: 31,
              signedUpAt: 1253740028201
            },
            mike: {
              fullName: 'Mike Schore',
              age: 28,
              signedUpAt: 1253746023201
            },
            wil: {
              fullName: 'Wil Bierbaum',
              age: 28,
              signedUpAt: 1253742028201
            }
          },
          blogs: {
            recipes: {
              name: 'Recipes from the Front',
              userId: 'mike',
              startedAt: 1253742029201
            },
            motorcycle: {
              name: 'The Pain of Motorcycle Maintenance',
              userId: 'jan',
              startedAt: 1253742929201
            }
          }
        });
      });

      c.after(function() {
        Repository.clear();
      });
    });
  };
});
