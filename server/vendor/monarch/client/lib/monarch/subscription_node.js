(function(Monarch) {

Monarch.constructor("Monarch.SubscriptionNode", {
  constructorProperties: {
    totalSubscriptions: 0
  },

  initialize: function() {
    this.subscriptions = [];
    this.paused = false;
    this.delayedEvents = [];
  },

  subscribe: function(callback, context) {
    var subscription = new Monarch.Subscription(this, callback, context);
    this.subscriptions.push(subscription);
    return subscription;
  },

  unsubscribe: function(subscription) {
    _.remove(this.subscriptions, subscription);
    if (this.onUnsubscribeNode) this.onUnsubscribeNode.publish(subscription);
  },

  onUnsubscribe: function(callback, context) {
    if (!this.onUnsubscribeNode) this.onUnsubscribeNode = new Monarch.SubscriptionNode();
    return this.onUnsubscribeNode.subscribe(callback, context);
  },

  publish: function() {
    var publishArguments = arguments;
    if (this.paused) {
      this.delayedEvents.push(publishArguments)
    } else {
      _.each(this.subscriptions, function(subscription) {
        subscription.trigger(publishArguments);
      })
    }
  },

  empty: function() {
    return this.subscriptions.length == 0;
  },

  pauseEvents: function() {
    this.paused = true;
  },

  resumeEvents: function() {
    this.paused = false;
    var delayedEvents = this.delayedEvents;
    this.delayedEvents = [];
    _.each(delayedEvents, function(event) {
      this.publish.apply(this, event);
    }, this);
  }
});

})(Monarch);
