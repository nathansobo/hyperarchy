(function(Monarch) {

Monarch.constructor("Monarch.SubscriptionNode", {
  constructor_properties: {
    total_subscriptions: 0
  },

  initialize: function() {
    this.subscriptions = [];
    this.paused = false;
  },

  subscribe: function(callback) {
    var subscription = new Monarch.Subscription(this, callback);
    this.subscriptions.push(subscription);
    return subscription;
  },

  unsubscribe: function(subscription) {
    Monarch.Util.remove(this.subscriptions, subscription);
    if (this.on_unsubscribe_node) this.on_unsubscribe_node.publish(subscription);
  },

  on_unsubscribe: function(callback) {
    if (!this.on_unsubscribe_node) this.on_unsubscribe_node = new Monarch.SubscriptionNode();
    return this.on_unsubscribe_node.subscribe(callback);
  },

  publish: function() {
    var publish_arguments = arguments;
    if (this.paused) {
      this.delayed_events.push(publish_arguments)
    } else {
      Monarch.Util.each(this.subscriptions, function(subscription) {
        subscription.trigger(publish_arguments);
      })
    }
  },

  empty: function() {
    return this.subscriptions.length == 0;
  },

  pause_events: function() {
    this.paused = true;
    this.delayed_events = [];
  },

  resume_events: function() {
    var self = this;
    this.paused = false;
    Monarch.Util.each(this.delayed_events, function(event) {
      self.publish.apply(self, event);
    });
    this.delayed_events = [];
  }
});

})(Monarch);
