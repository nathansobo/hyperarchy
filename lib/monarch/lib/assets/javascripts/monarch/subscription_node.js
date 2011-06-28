(function(Monarch) {

_.constructor("Monarch.SubscriptionNode", {
  constructorProperties: {
    totalSubscriptions: 0
  },

  initialize: function() {
    this.subscriptions = [];
    this.paused = false;
    this.delayedEvents = [];
    this.chainedNodes = [];
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

  chain: function(otherNode) {
    this.chainedNodes.push(otherNode);
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
      });
      _.each(this.chainedNodes, function(node) {
        node.publish.apply(node, publishArguments);
      });
    }
  },

  publishForPromise: function() {
    var publishArguments = arguments;
    if (this.paused) throw new Error("Not implemented for paused nodes");
    if (this.chainedNodes.length !== 0) throw new Error("Not implemented for chained nodes");

    var combinedPromise = new Monarch.Promise();
    var successesRemaining = 0;

    function attemptCombinedSuccess() {
      if (--successesRemaining === 0) combinedPromise.triggerSuccess();
    };

    _.each(this.subscriptions, function(subscription) {
      var promise = subscription.trigger(publishArguments);
      if (promise) {
        successesRemaining++;
        promise.success(attemptCombinedSuccess);
      }
    });

    return combinedPromise;
  },

  publishArgs: function(array) {
    this.publish.apply(this, array);
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
  },

  size: function() {
    return this.subscriptions.length;
  }
});

})(Monarch);
