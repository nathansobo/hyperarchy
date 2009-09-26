Screw.Unit(function(c) {
  c.use_remote_fixtures = function() {
    c.use_fake_server();
    c.init(function() {
      Server.Repository.load_fixtures({
        organizations: {
          meta: {
            name: "Meta Hyperarchy"
          }
        }
      });
    });
  };
})
