Screw.Unit(function(c) {
  c.use_local_fixtures = function() {
    c.use_example_domain_model(function() {
      c.init(function() {
        Repository.load_fixtures({
          users: {
            jan: {
              full_name: 'Jan Nelson',
              age: 31,
              signed_up_at: 1253740028201
            },
            mike: {
              full_name: 'Mike Schore',
              age: 28,
              signed_up_at: 1253746023201
            },
            wil: {
              full_name: 'Wil Bierbaum',
              age: 28,
              signed_up_at: 1253742028201
            }
          },
          blogs: {
            recipes: {
              name: 'Recipes from the Front',
              user_id: 'mike',
              started_at: 1253742029201
            },
            motorcycle: {
              name: 'The Pain of Motorcycle Maintenance',
              user_id: 'jan',
              started_at: 1253742929201
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
