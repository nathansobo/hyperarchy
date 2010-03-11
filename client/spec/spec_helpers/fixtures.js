Screw.Unit(function(c) {
  c.useRemoteFixtures = function() {
    c.useFakeServer();
    c.init(function() {
      Repository.clear();
      Server.Repository.loadFixtures({
        organizations: {
          meta: {
            name: "Meta Hyperarchy"
          },
          restaurant: {
            name: "Restaurant"
          }
        }
      });
    });
  };
})
