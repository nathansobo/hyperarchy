Screw.Unit(function(c) {
  c.useFakeApplicationController = function() {
    c.useRemoteFixtures();
    c.init(function() {
      window.Application = new FakeApplicationController();
    });
  };

  c.authenticate = function(userId) {
    Server.autoFetch([User.where({id: userId})]);
    var user = User.fixture(userId);
    if (!user) throw new Error("User with id " + userId + " not found in remote repository");
    Application.currentUserId = userId;
    return user;
  };
});

_.constructor("FakeApplicationController", Controllers.Application, {
  initialize: _.identity
});