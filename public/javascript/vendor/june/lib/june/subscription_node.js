module("June", function(c) { with(c) {
  constructor("SubscriptionNode", function() {
    def('initialize', function() {
      this.subscriptions = [];
    });

    def('subscribe', function(handler) {
      var subscription = new June.Subscription(this, handler);
      this.subscriptions.push(subscription);
      return subscription;
    });

    def('unsubscribe', function(subscription) {
      June.remove(this.subscriptions, subscription);
      if (this.on_unsubscribe_node) this.on_unsubscribe_node.publish(subscription);
    });
    
    def('on_unsubscribe', function(handler) {
      if (!this.on_unsubscribe_node) this.on_unsubscribe_node = new June.SubscriptionNode();
      return this.on_unsubscribe_node.subscribe(handler);
    });

    def('publish', function() {
      var publish_arguments = arguments;
      jQuery.each(this.subscriptions, function() {
        this.trigger(publish_arguments);
      })
    })

    def('is_empty', function() {
      return this.subscriptions.length == 0;
    });
  });
}});