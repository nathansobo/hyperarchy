Screw.Unit(function(c) {
  c.use_fake_history = function() {
    var original_history;

    c.init(function() {
      original_history = History;
      History = new FakeHistory();
    });

    c.after(function() {
      History = original_history;
    })
  };
});

Monarch.constructor("FakeHistory", {
  initialize: function() {
    this.on_change_node = new Monarch.SubscriptionNode();
    this.path = "";
  },

  on_change: function(callback) {
    this.on_change_node.subscribe(callback);
    callback(this.path);
  },

  load: function(path) {
    this.on_change_node.publish(path)
  }
});
