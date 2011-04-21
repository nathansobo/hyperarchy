(function(Monarch) {

_.constructor("Monarch.Subscription", {
  initialize: function(node, callback, context) {
    this.node = node;
    this.callback = callback;
    this.context = context
  },

  trigger: function(args) {
    this.callback.apply(this.context, args);
  },

  destroy: function() {
    this.node.unsubscribe(this);
  }
});

})(Monarch);
