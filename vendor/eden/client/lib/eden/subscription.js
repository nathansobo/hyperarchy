constructor("Subscription", {
  initialize: function(node, handler) {
    this.node = node;
    this.handler = handler;
  },

  trigger: function(args) {
    this.handler.apply(null, args);
  },

  destroy: function() {
    this.node.unsubscribe(this);
  }
});
