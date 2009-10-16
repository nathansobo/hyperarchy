(function(Monarch) {

Monarch.constructor("Monarch.Subscription", {
  initialize: function(node, callback) {
    this.node = node;
    this.callback = callback;
  },

  trigger: function(args) {
    this.callback.apply(null, args);
  },

  destroy: function() {
    this.node.unsubscribe(this);
  }
});

})(Monarch);
