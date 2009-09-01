constructor("SubscriptionNode", {
  initialize: function() {
    this.subscriptions = [];
  },

  subscribe: function(handler) {
    var subscription = new Subscription(this, handler);
    this.subscriptions.push(subscription);
    return subscription;
  },

  unsubscribe: function(subscription) {
    Util.remove(this.subscriptions, subscription);
    if (this.on_unsubscribe_node) this.on_unsubscribe_node.publish(subscription);
  },

  on_unsubscribe: function(handler) {
    if (!this.on_unsubscribe_node) this.on_unsubscribe_node = new SubscriptionNode();
    return this.on_unsubscribe_node.subscribe(handler);
  },

  publish: function() {
    var publish_arguments = arguments;
    jQuery.each(this.subscriptions, function() {
      this.trigger(publish_arguments);
    })
  },

  is_empty: function() {
    return this.subscriptions.length == 0;
  }
});
