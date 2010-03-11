Screw.Unit(function(c) {
  c.useFakeHistory = function() {
    var originalHistory;

    c.init(function() {
      originalHistory = History;
      History = new FakeHistory();
    });

    c.after(function() {
      History = originalHistory;
    })
  };
});

Monarch.constructor("FakeHistory", {
  initialize: function() {
    this.onChangeNode = new Monarch.SubscriptionNode();
    this.path = "";
  },

  onChange: function(callback) {
    this.onChangeNode.subscribe(callback);
    callback(this.path);
  },

  load: function(path) {
    this.path = path;
    this.onChangeNode.publish(path);
  }
});
