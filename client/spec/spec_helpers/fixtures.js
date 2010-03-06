Screw.Unit(function(c) {
  c.useRemoteFixtures = function() {
    c.useFakeServer();
    c.init(function() {
      Server.Repository.loadFixtures({
        organizations: {
          meta: {
            name: "Meta Hyperarchy"
          }
        }
      });
    });
  };
})
