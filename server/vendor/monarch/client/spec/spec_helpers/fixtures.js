Screw.Unit(function(c) {
  c.use_local_fixtures = function() {
    c.use_example_domain_model(function() {
      c.init(function() {
        Repository.fixtures({
          users: {
            jan: {
              full_name: 'Jan Nelson',
              age: 31
            },
            mike: {
              full_name: 'Mike Schore',
              age: 28
            },
            wil: {
              full_name: 'Wil Bierbaum',
              age: 28
            }
          },
          blogs: {
            recipes: {
              name: 'Recipes from the Front',
              user_id: 'mike'
            },
            motorcycle: {
              name: 'The Pain of Motorcycle Maintenance',
              user_id: 'jan'
            }
          }
        });

        Repository.load_fixtures();
      });

      c.after(function() {
        Repository.clear();
      });
    });
  };
});
