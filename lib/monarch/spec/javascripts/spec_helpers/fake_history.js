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

_.constructor("FakeHistory", {
  initialize: function() {
    this.hashchangeNode = new Monarch.SubscriptionNode();
  },

  hashchange: function(callback) {
    this.hashchangeNode.subscribe(callback);
    callback();
  },

  fragment: function(fragment) {
    if (arguments.length == 1) {
      var oldFragment = this._fragment;
      this._fragment = fragment;
      if (fragment !== oldFragment) this.hashchangeNode.publish();
    }
    return this._fragment;
  },

  setFragment: function(fragment) {
    this._fragment = fragment;
  }
});
